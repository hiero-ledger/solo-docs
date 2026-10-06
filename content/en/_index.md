---
title: Solo
description: Deploy and manage Hiero networks with ease
---

<section id="hero" class="hero-section" aria-labelledby="hero-title">
{{< hero-traces >}}
<div class="container hero-section-inner">
<p class="hero-section-eyebrow">A Hiero Ledger CLI Tool</p>
{{< hero-mark-scene >}}
<div class="hero-section-lockup">
<h1 id="hero-title" class="hero-section-title">Solo</h1>
<div class="hero-section-pitch">
<p class="hero-section-lede">An opinionated CLI tool to deploy and manage standalone Hiero Ledger test networks locally or in the cloud</p>
<div class="hero-section-actions">
<a class="hero-section-action hero-section-action--primary" href="docs/simple-solo-setup/quickstart/">Quickstart</a>
<a class="hero-section-action hero-section-action--ghost" href="docs/">Browse Docs</a>
<a class="hero-section-action hero-section-action--ghost" href="https://github.com/hiero-ledger/solo" target="_blank" rel="noopener">Browse the Code<span class="hero-section-action-glyph" aria-hidden="true">&#8599;</span></a>
</div>
</div>
</div>
</div>
</section>

<div class="features-section" >
{{% blocks/section color="white" type="row" %}}
  {{% blocks/feature svg="icons/one-shot-deployment.svg" title="One-Shot Deployment" %}} Deploy a complete Hiero network with consensus nodes,
  mirror node, explorer, and JSON RPC relay in a single command. Perfect for rapid development and testing.
  {{% /blocks/feature %}}

{{% blocks/feature svg="icons/kubernetes-native.svg" title="Kubernetes Native" %}} Built on Kubernetes for scalability and reliability.
Deploy locally with Kind or to any cloud environment. Multi-cluster support for production-like testing.
{{% /blocks/feature %}}

{{% blocks/feature icon="fa-terminal" title="Developer Friendly" %}} Intuitive CLI with interactive prompts,
comprehensive documentation, and sensible defaults. Get a working network in minutes, not hours. {{% /blocks/feature %}}

{{% /blocks/section %}}

</div>

{{< section-divider >}}

{{% blocks/section color="light" %}}

<div class="col-12 core-capabilities">
  {{< hero-traces variant="light" >}}
  <header class="capabilities-header">
    <div>
      <p class="capabilities-eyebrow">Capabilities</p>
      <h2 id="capabilities-heading" class="capabilities-heading">Core Capabilities</h2>
    </div>
    <div class="capabilities-intro">
      <p class="capabilities-copy">Everything you need to stand up, operate, and tear down Hiero test networks — from one-shot local deployments to multi-cluster, production-like testing.</p>
      <ul role="list" class="capabilities-features">
        <li>CLI-first</li>
        <li>Kubernetes native</li>
        <li>Open source</li>
      </ul>
    </div>
  </header>
  <div class="row">
    <div class="col-md-6 mb-4">
      <div class="card h-100">
        <div class="card-body p-3">
          <div class="d-flex align-items-center mb-4">
            <span class="card-icon-badge"><i class="fas fa-network-wired"></i></span>
            <h3 class="mb-0 card-title">Network Management</h3>
          </div>
          <p class="text-muted card-description">
            Deploy and manage multiple consensus nodes with configurable network topology. Support for both local development and cloud deployments.
          </p>
          <ul class="list-unstyled">
            <li><i class="fas fa-check text-success me-2"></i>Dynamic node addition and removal</li>
            <li><i class="fas fa-check text-success me-2"></i>Node upgrade and configuration</li>
            <li><i class="fas fa-check text-success me-2"></i>Multi-cluster deployments</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="col-md-6 mb-4">
      <div class="card h-100">
        <div class="card-body p-3">
          <div class="d-flex align-items-center mb-4">
            <span class="card-icon-badge"><i class="fas fa-cogs"></i></span>
            <h3 class="mb-0 card-title">Complete Ecosystem</h3>
          </div>
          <p class="text-muted card-description">
            Deploy the full Hiero stack including mirror node for historical data, block explorer for network visibility, and JSON RPC relay for EVM compatibility.
          </p>
          <ul class="list-unstyled">
            <li><i class="fas fa-check text-success me-2"></i>Mirror Node & PostgreSQL</li>
            <li><i class="fas fa-check text-success me-2"></i>Hiero Explorer</li>
            <li><i class="fas fa-check text-success me-2"></i>JSON RPC Relay</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="col-md-6 mb-4">
      <div class="card h-100">
        <div class="card-body p-3">
          <div class="d-flex align-items-center mb-4">
            <span class="card-icon-badge"><i class="fas fa-shield-alt"></i></span>
            <h3 class="mb-0 card-title">State Management</h3>
          </div>
          <p class="text-muted card-description">
            Advanced state management capabilities for backup, restore, and migration scenarios. Test complex upgrade paths and disaster recovery.
          </p>
          <ul class="list-unstyled">
            <li><i class="fas fa-check text-success me-2"></i>Network state backup & restore</li>
            <li><i class="fas fa-check text-success me-2"></i>Cross-cluster migration</li>
            <li><i class="fas fa-check text-success me-2"></i>Version upgrade testing</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="col-md-6 mb-4">
      <div class="card h-100">
        <div class="card-body p-3">
          <div class="d-flex align-items-center mb-4">
            <span class="card-icon-badge"><i class="fas fa-puzzle-piece"></i></span>
            <h3 class="mb-0 card-title">Flexible Configuration</h3>
          </div>
          <p class="text-muted card-description">
            Customize every aspect of your network with configuration profiles, custom resources, and environment variables for different testing scenarios.
          </p>
          <ul class="list-unstyled">
            <li><i class="fas fa-check text-success me-2"></i>Resource profiles for different hardware</li>
            <li><i class="fas fa-check text-success me-2"></i>Custom application properties</li>
            <li><i class="fas fa-check text-success me-2"></i>Network topology configuration</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
{{% /blocks/section %}}
