namespace AdminApi.Models.Forms;

public class LinksForm
{
    public List<LinkForm> ExternalLinks { get; set; }
}

public class LinkForm
{
    public string Name { get; set; }
    public string Url { get; set; }

    public bool Ready() => !string.IsNullOrEmpty(Name) && !string.IsNullOrEmpty(Url);
}
