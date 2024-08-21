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
    bool Edition
) : IRequest;

public class CreateObjktNftRequestHandler(
    IMongoDatabase mongoDatabase,
    IMediator mediator
) : IRequestHandler<CreateObjktNftRequest>
{
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task Handle(CreateObjktNftRequest request, CancellationToken cancellationToken)
    {
        var existentNftCursor = await _nftsCollection.FindAsync(n => n.Name == request.Name);
        var existentNft = await existentNftCursor.FirstOrDefaultAsync(cancellationToken: cancellationToken);

        if (existentNft == null)
        {
            var newNft = new NftArt
            {
                Name = request.Name,
                Description = request.Description,
                Address = request.ContractAddress,
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

        var foundContract = existentNft.Contracts?.FirstOrDefault(c => c.ContractAddress == request.ContractAddress);
        if (foundContract is not null)
            return;

        existentNft.Address = request.ContractAddress;
        existentNft.NftChain = NftChain.Ethereum;
        existentNft.Collection = request.Collection;
        existentNft.ExternalLinks.AddLink(new() { Name = ExternalLinkEnum.ObktOneLink, Url = request.ObjktUrl });
        existentNft.Contracts.Add(new Contract
        {
            ContractAddress = request.ContractAddress,
            NftChain = NftChain.Tezos,
            SourceId = request.TokenId
        });

        await _nftsCollection.ReplaceOneAsync(n => n.Id == existentNft.Id, existentNft, cancellationToken: cancellationToken);
    }
}