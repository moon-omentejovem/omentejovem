using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbSeeder;

public class MigrationRunner
{
    private readonly IMongoDatabase _database;

    public MigrationRunner(IMongoDatabase database)
    {
        _database = database;
    }

    public async Task RunMigration()
    {

    }
}
