namespace Domain.Models;

public class ExternalLinks
{
    private List<ExternalLink> links = [];

    public List<ExternalLink> Links { get => links; private set => links = value; }

    public ExternalLinks()
    {
    }

    public ExternalLinks(ExternalLink externalLink)
    {
        links = [externalLink];
    }

    public void AddLink(ExternalLink link)
    {
        links.RemoveAll(l => l.Name == link.Name);
        links.Add(link);
    }
}

public class ExternalLink
{
    public ExternalLinkEnum Name { get; set; }
    public string Url { get; set; } = string.Empty;
}

public enum ExternalLinkEnum
{
    Rarible,
    Manifold,
    OpenSea,
    SuperRare,
    ObktOneLink
}