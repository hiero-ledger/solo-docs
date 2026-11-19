{{- /*
  Per-page Markdown output format (outputFormats.markdown in hugo.yaml). The
  Markdown itself comes from partials/markdown-page.html, shared with
  /llms-full.txt.
*/ -}}
{{- $out := partial "markdown-page.html" . -}}
{{- if .IsSection -}}
  {{- /* Section pages render at .../index.md (Hugo always puts a section's
         output in its directory). Also publish a copy at the section URL
         with .md appended, e.g. /docs/simple-solo-setup.md, so "add .md to
         the page URL" works for every docs page. The site's base path (set
         for non-root deploys) is stripped, since publish paths are relative
         to the site root. */ -}}
  {{- $basePath := strings.TrimSuffix "/" (urls.Parse site.BaseURL).Path -}}
  {{- $sectionPath := strings.Trim (strings.TrimPrefix $basePath .RelPermalink) "/" -}}
  {{- with $sectionPath -}}
    {{- $_ := (resources.FromString (printf "%s.md" .) (printf "%s\n" $out)).Publish -}}
  {{- end -}}
{{- end -}}
{{ $out }}
