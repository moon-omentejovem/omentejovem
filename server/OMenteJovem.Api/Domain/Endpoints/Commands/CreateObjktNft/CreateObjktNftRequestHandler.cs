using Domain.Database;
using Domain.Endpoints.Commands.CreateCollection;
using Domain.Models;
using Domain.Models.Enums;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Commands.CreateObjktNft;

public record CreateObjktNftRequest(
    string Name,
    string Description,
    string ContractAddress,
    string Collection,
    string CollectionDescription,
    string Timestamp,
    string TokenId,
    string ObjktUrl,
    bool Edition,
    IEnumerable<CreateObktNftOwnerRequest> Owners
) : IRequest;

public record CreateObktNftOwnerRequest(
    string Address,
    string? Alias,
    int Quantity
);

public class CreateObjktNftRequestHandler(
    IMongoDatabase mongoDatabase,
    IMediator mediator
) : IRequestHandler<CreateObjktNftRequest>
{
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task Handle(CreateObjktNftRequest request, CancellationToken cancellationToken)
    {
        var existentNft = await _nftsCollection.Find(n => 
            n.Address == request.ContractAddress &&
            n.Name == request.Name
        ).FirstOrDefaultAsync(cancellationToken: cancellationToken);

        if (existentNft == null)
        {
            var newNft = new NftArt
            {
                Name = request.Name,
                Description = request.Description,
                Address = request.ContractAddress,
                SourceId = request.TokenId,
                NftChain = NftChain.Tezos,
                Collection = request.Collection,
                Edition = request.Edition,
                ExternalLinks = new ExternalLinks(new() { Name = ExternalLinkEnum.ObktOneLink, Url = request.ObjktUrl }),
                Contracts = [
                    new Contract
                    {
                        ContractAddress = request.ContractAddress,
                        NftChain = NftChain.Tezos,
                        SourceId = request.TokenId
                    }
                ],
                Owners = request.Owners.Select(o => new Owner
                {
                    Quantity = o.Quantity,
                    Alias = o.Alias,
                    Address = o.Address,
                }).ToList()
            };

            await mediator.Send(new CreateCollectionRequest(
                Address: request.ContractAddress,
                Name: request.Collection,
                SourceId: request.Collection,
                Description: request.CollectionDescription,
                Year: DateTime.Parse(request.Timestamp).Year.ToString(),
                NftChain: NftChain.Tezos
            ), cancellationToken);

            await _nftsCollection.InsertOneAsync(newNft, cancellationToken: cancellationToken);

            return;
        }

        existentNft.Address = request.ContractAddress;
        existentNft.SourceId = request.TokenId;
        existentNft.NftChain = NftChain.Tezos;
        existentNft.Collection = request.Collection;
        existentNft.ExternalLinks.AddLink(new() { Name = ExternalLinkEnum.ObktOneLink, Url = request.ObjktUrl });

        existentNft.Owners = request.Owners.Select(o => new Owner
        {
            Quantity = o.Quantity,
            Alias = o.Alias,
            Address = o.Address,
        }).ToList();

        existentNft.Contracts ??= [];
        existentNft.AddContract(new Contract
        {
            ContractAddress = request.ContractAddress,
            NftChain = NftChain.Tezos,
            SourceId = request.TokenId
        });

        await _nftsCollection.ReplaceOneAsync(n => n.Id == existentNft.Id, existentNft, cancellationToken: cancellationToken);
    }
}