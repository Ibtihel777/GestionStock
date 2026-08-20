using ERPStock.Application.Services;
using Xunit;

namespace ERPStock.Tests;

public class CmupCalculationTests
{
    [Fact]
    public void CalculateCmup_DeuxEntreesPrixDifferents_RetourneMoyennePonderee()
    {
        // Arrange : 100 unités à 0.50, puis entrée de 50 unités à 0.80
        int previousQuantity = 100;
        decimal previousCmup = 0.50m;
        int entryQuantity = 50;
        decimal entryUnitPrice = 0.80m;

        // Act
        decimal result = MouvementStockService.CalculateCmup(
            previousQuantity, previousCmup, entryQuantity, entryUnitPrice);

        // Assert : (100×0.50 + 50×0.80) / 150 = 0.60
        Assert.Equal(0.60m, result);
    }

    [Fact]
    public void CalculateCmup_PremiereEntree_RetournePrixEntree()
    {
        // Arrange : aucun stock avant, première entrée à 0.50
        int previousQuantity = 0;
        decimal previousCmup = 0;
        int entryQuantity = 100;
        decimal entryUnitPrice = 0.50m;

        // Act
        decimal result = MouvementStockService.CalculateCmup(
            previousQuantity, previousCmup, entryQuantity, entryUnitPrice);

        // Assert : le CMUP doit être égal au prix d'entrée
        Assert.Equal(0.50m, result);
    }

    [Fact]
    public void CalculateCmup_MemePrixQueStockExistant_CmupInchange()
    {
        // Arrange : 100 unités à 0.50, entrée de 50 unités au même prix 0.50
        int previousQuantity = 100;
        decimal previousCmup = 0.50m;
        int entryQuantity = 50;
        decimal entryUnitPrice = 0.50m;

        // Act
        decimal result = MouvementStockService.CalculateCmup(
            previousQuantity, previousCmup, entryQuantity, entryUnitPrice);

        // Assert
        Assert.Equal(0.50m, result);
    }

    [Theory]
    [InlineData(200, 1.00, 100, 2.00, 1.3333333333)]   // Prix plus élevé tire le CMUP vers le haut
    [InlineData(50, 2.00, 150, 1.00, 1.25)]              // Grosse entrée à prix plus bas
    public void CalculateCmup_CasVaries_RetourneValeurAttendue(
        int previousQuantity, decimal previousCmup,
        int entryQuantity, decimal entryUnitPrice,
        decimal expected)
    {
        decimal result = MouvementStockService.CalculateCmup(
            previousQuantity, previousCmup, entryQuantity, entryUnitPrice);

        Assert.Equal(expected, result, precision: 4);
    }
}