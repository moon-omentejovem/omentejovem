using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Utils;

internal class LogTimer
{
    public static TResult LogTimestamp<TResult>(ILogger loggerInstance, Func<TResult> func, string queryName = "")
    {
        var now = DateTime.Now;

        var result = func();

        var end = DateTime.Now;

        if (queryName == string.Empty)
        {
            loggerInstance.LogInformation("Elapsed time: {elapsedTime} milliseconds", (end - now).TotalMilliseconds);
        }
        else
        {
            loggerInstance.LogInformation("Elapsed time for query {queryName}: {elapsedTime} milliseconds", queryName, (end - now).TotalMilliseconds);
        }

        return result;
    }

    public static async Task<TResult> LogTimestampAsync<TResult>(ILogger loggerInstance, Func<Task<TResult>> func, string queryName = "")
    {
        var now = DateTime.Now;

        var result = await func();

        var end = DateTime.Now;

        if (queryName == string.Empty)
        {
            loggerInstance.LogInformation("Elapsed time: {elapsedTime} milliseconds", (end - now).TotalMilliseconds);
        }
        else
        {
            loggerInstance.LogInformation("Elapsed time for query {queryName}: {elapsedTime} milliseconds", queryName, (end - now).TotalMilliseconds);
        }

        return result;
    }
}
