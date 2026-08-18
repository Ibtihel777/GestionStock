using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using ERPStock.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ERPStock.Infrastructure.Services;

public class GeminiVisionService : IVisionService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public GeminiVisionService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<int> CountArticlesAsync(
        byte[] image,
        string contentType,
        string articleDesignation,
        int? unitesParCarton,
        CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["Gemini:ApiKey"]
            ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException(
                "La clé Gemini n'est pas configurée. Définissez GEMINI_API_KEY ou Gemini__ApiKey sur le serveur.");

        if (!contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Le fichier envoyé doit être une image.");

        var model = _configuration["Gemini:Model"] ?? "gemini-3.5-flash-lite";
        var requestBody = new
        {
            model,
            input = new object[]
            {
                new
                {
                    type = "image",
                    mime_type = contentType,
                    data = Convert.ToBase64String(image)
                },
                new
                {
                    type = "text",
                    text = BuildCountingPrompt(articleDesignation, unitesParCarton)
                }
            }
        };

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://generativelanguage.googleapis.com/v1beta/interactions")
        {
            Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
        };
        request.Headers.Add("x-goog-api-key", apiKey);
        request.Headers.Add("Api-Revision", "2026-05-20");

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new GeminiApiException(ToUserMessage(response.StatusCode, content), response.StatusCode, content);

        using var document = JsonDocument.Parse(content);
        var outputText = GetOutputText(document.RootElement);
        var countMatch = Regex.Match(outputText, @"\d+");
        if (!countMatch.Success || !int.TryParse(countMatch.Value, out var quantity) || quantity < 0)
        {
            throw new InvalidOperationException("Gemini n'a pas retourné un comptage valide.");
        }

        return quantity;
    }

    private static string BuildCountingPrompt(string articleDesignation, int? unitesParCarton) =>
        unitesParCarton.HasValue
            ? $"Compte uniquement les cartons visibles de l'article « {articleDesignation} » sur cette photo de stock. Ne compte pas les unités individuelles : elles sont invisibles à l'intérieur des cartons fermés. Ignore les articles différents, les étiquettes et les emballages vides. Réponds uniquement par le nombre entier de cartons, positif ou zéro, sans texte, sans unité et sans JSON."
            : $"Compte uniquement les unités visibles de l'article « {articleDesignation} » sur cette photo de stock. Ignore les articles différents, les étiquettes et les emballages vides. Réponds uniquement par un nombre entier positif ou zéro, sans texte, sans unité et sans JSON.";

    private static string GetOutputText(JsonElement response)
    {
        if (!response.TryGetProperty("steps", out var steps))
        {
            throw new InvalidOperationException("Gemini n'a pas retourné de résultat exploitable.");
        }

        foreach (var step in steps.EnumerateArray())
        {
            if (!step.TryGetProperty("type", out var type)
                || type.GetString() != "model_output"
                || !step.TryGetProperty("content", out var content))
                continue;

            foreach (var part in content.EnumerateArray())
            {
                if (part.TryGetProperty("type", out var partType)
                    && partType.GetString() == "text"
                    && part.TryGetProperty("text", out var text)
                    && !string.IsNullOrWhiteSpace(text.GetString()))
                    return text.GetString()!;
            }
        }

        throw new InvalidOperationException("La réponse Gemini ne contient pas de texte exploitable.");
    }

    private static string ToUserMessage(HttpStatusCode statusCode, string providerResponse)
    {
        var providerMessage = TryGetProviderMessage(providerResponse);
        return statusCode switch
        {
            HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden => "Gemini a refusé la clé ou son accès au modèle. " + providerMessage,
            HttpStatusCode.TooManyRequests => "La limite gratuite Gemini est atteinte. Réessayez plus tard. " + providerMessage,
            HttpStatusCode.BadRequest => "Gemini a rejeté la requête. " + providerMessage,
            _ => "Gemini a échoué (HTTP " + (int)statusCode + "). " + providerMessage
        };
    }

    private static string TryGetProviderMessage(string providerResponse)
    {
        try
        {
            using var document = JsonDocument.Parse(providerResponse);
            if (document.RootElement.TryGetProperty("error", out var error)
                && error.TryGetProperty("message", out var message)
                && !string.IsNullOrWhiteSpace(message.GetString()))
                return "Détail : " + message.GetString();
        }
        catch (JsonException)
        {
            // La réponse non JSON reste visible uniquement dans le log serveur.
        }

        return "Consultez le terminal de l'API pour le détail.";
    }
}

public class GeminiApiException : HttpRequestException
{
    public GeminiApiException(string message, HttpStatusCode statusCode, string providerResponse)
        : base(message, null, statusCode)
    {
        ProviderResponse = providerResponse;
    }

    public string ProviderResponse { get; }
}
