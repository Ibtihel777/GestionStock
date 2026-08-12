namespace ERPStock.Application.DTOs;

public class SignalementDto
{
    public int Id { get; set; }
    public DateTime DateSignalement { get; set; }
    public int QuantiteTheorique { get; set; }
    public int QuantiteDetectee { get; set; }
    public int Ecart { get; set; }
    public string Statut { get; set; } = string.Empty;
    public string SignalePar { get; set; } = string.Empty;
    public int ArticleId { get; set; }
    public string ArticleReference { get; set; } = string.Empty;
    public string ArticleDesignation { get; set; } = string.Empty;
    public int EmplacementId { get; set; }
    public string CodeEmplacement { get; set; } = string.Empty;
}
