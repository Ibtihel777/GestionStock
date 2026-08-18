namespace ERPStock.Application.Interfaces;

public interface IVisionService
{
    Task<int> CountArticlesAsync(
        byte[] image,
        string contentType,
        string articleDesignation,
        int? unitesParCarton,
        CancellationToken cancellationToken = default);
}
