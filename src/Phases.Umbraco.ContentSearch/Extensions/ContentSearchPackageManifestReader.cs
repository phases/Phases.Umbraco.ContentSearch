using System.Reflection;
using Umbraco.Cms.Core.Manifest;
using Umbraco.Cms.Infrastructure.Manifest;

namespace Phases.Umbraco.ContentSearch.Extensions;

/// <summary>
/// Registers the Content Search backoffice package manifest from server-side code so the
/// backoffice reliably discovers the bundle when static assets are supplied via an RCL.
/// </summary>
internal sealed class ContentSearchPackageManifestReader : IPackageManifestReader
{
    private const string PackageId = "Phases.Umbraco.ContentSearch";
    private const string BundleAlias = "Phases.Umbraco.ContentSearch.Bundle";
    private const string BundleScriptPath =
        "/App_Plugins/PhasesUmbracoContentSearch/phases-umbraco-content-search.js";

    /// <inheritdoc />
    public Task<IEnumerable<PackageManifest>> ReadPackageManifestsAsync()
    {
        var version = Assembly
            .GetAssembly(typeof(ContentSearchPackageManifestReader))
            ?.GetName()
            .Version?
            .ToString() ?? "0.0.0";

        PackageManifest manifest = new()
        {
            Id = PackageId,
            Name = "Phases Content Search",
            Version = version,
            AllowTelemetry = false,
            Extensions =
            [
                new
                {
                    name = "Phases Umbraco Content Search Bundle",
                    alias = BundleAlias,
                    type = "bundle",
                    js = $"{BundleScriptPath}?v={version}",
                },
            ],
        };

        return Task.FromResult<IEnumerable<PackageManifest>>([manifest]);
    }
}
