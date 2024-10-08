using System.ComponentModel.DataAnnotations;

namespace AdminApi.Models.Forms;

public class OwnerForm
{
    [Required]
    public string Address { get; set; } = string.Empty;
    [Required]
    public int Quantity { get; set; } = 1;
    public string? Alias { get; set; }
}
