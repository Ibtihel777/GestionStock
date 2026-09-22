using System.Net;

using var client = new HttpClient
{
    Timeout = TimeSpan.FromSeconds(3)
};

try
{
    using var response = await client.GetAsync("http://127.0.0.1:8080/health");
    return response.StatusCode == HttpStatusCode.OK ? 0 : 1;
}
catch (HttpRequestException)
{
    return 1;
}
catch (TaskCanceledException)
{
    return 1;
}
