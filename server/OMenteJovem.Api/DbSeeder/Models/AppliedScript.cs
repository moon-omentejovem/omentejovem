namespace DbSeeder.Models;

public record AppliedScript
{
    public string Name { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
}