---
title: "Solo CLI Reference"
weight: 1
aliases:
- /docs/solo-cli/
- /docs/solo-commands/
- /docs/advanced-solo-setup/solo-cli/
description: >
  Canonical Solo CLI command and flag reference for end users.
categories: ["Advanced", "Reference"]
tags: ["cli", "commands", "reference"]
type: docs
---

## Overview

This page is the canonical command reference for the Solo CLI.

- Use it to look up command paths, subcommands, and flags.
- Use `solo <command> --help` and `solo <command> <subcommand> --help` for runtime help on your installed version.
- For legacy command mappings, see [CLI Migration Reference](/docs/advanced-solo-setup/cli/cli-migrations).

## Output Formats (`--output`, `-o`)

Solo supports machine-readable output for version output and for command execution flows that honor the output format flag.

```bash
solo --version -o json
solo --version -o yaml
solo --version -o wide
```

Expected formats:

- `json`: JSON object output.
- `yaml`: YAML output.
- `wide`: plain text value-oriented output.

## Global Flags

Global flags shown in root help:

- `--dev`: enable developer mode.
- `--force-port-forward`: force port forwarding for network services.
- `-v`, `--version`: print Solo version.

## Command and Flag Reference

The sections below are generated from Solo CLI help output using the implementation on `hiero-ledger/solo` (main), commit `f800d3c`.

## Root Help Output

```
Usage:
  solo <command> [options]

Commands:
  init         Initialize local environment
  config       Backup and restore component configurations for Solo deployments. These commands display what would be backed up or restored without performing actual operations.
  block        Block Node operations for creating, modifying, and destroying resources. These commands require the presence of an existing deployment.
  cluster-ref  Manages the relationship between Kubernetes context names and Solo cluster references which are an alias for a kubernetes context.
  consensus    Consensus Node operations for creating, modifying, and destroying resources. These commands require the presence of an existing deployment.
  deployment   Create, modify, and delete deployment configurations. Deployments are required for most of the other commands.
  explorer     Explorer Node operations for creating, modifying, and destroying resources.These commands require the presence of an existing deployment.
  keys         Consensus key generation operations
  ledger       System, Account, and Crypto ledger-based management operations. These commands require an operational set of consensus nodes and may require an operational mirror node.
  mirror       Mirror Node operations for creating, modifying, and destroying resources. These commands require the presence of an existing deployment.
  relay        RPC Relay Node operations for creating, modifying, and destroying resources. These commands require the presence of an existing deployment.
  one-shot     One Shot commands for new and returning users who need a preset environment type. These commands use reasonable defaults to provide a single command out of box experience.
  rapid-fire   Commands for performing load tests a Solo deployment

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

## init

```
init

Initialize local environment

Options:

                                                                                                         
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
-u,  --user                Optional user name used for     [string]                                      
                           local configuration. Only                                                     
                           accepts letters and numbers.                                                  
                           Defaults to the username                                                      
                           provided by the OS                                                            
-v,  --version             Show version number             [boolean]
```

## config

```
config

Backup and restore component configurations for Solo deployments. These commands display what would be backed up or restored without performing actual operations.

Commands:
  config ops   Configuration backup and restore operations

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### config ops

```
config ops

Configuration backup and restore operations

Commands:
  config ops backup             Display backup plan for all component configurations of a deployment. Shows what files and configurations would be backed up without performing the actual backup.
  config ops restore-config     Restore component configurations from backup. Imports ConfigMaps, Secrets, logs, and state files for a running deployment.
  config ops restore-clusters   Restore Kind clusters from backup directory structure. Creates clusters, sets up Docker network, installs MetalLB, and initializes cluster configurations. Does not deploy network components.
  config ops restore-network    Deploy network components to existing clusters from backup. Deploys consensus nodes, block nodes, mirror nodes, explorers, and relay nodes. Requires clusters to be already created (use restore-clusters first).

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### config ops backup

```
config ops backup

Display backup plan for all component configurations of a deployment. Shows what files and configurations would be backed up without performing the actual backup.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --output-dir          Path to the directory where     [string]                  
                           the command context will be                               
                           saved to                                                  
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]                 
     --zip-file            Path to the encrypted backup    [string]                  
                           ZIP archive used during                                   
                           restore                                                   
     --zip-password        Password to encrypt generated   [string]                  
                           backup ZIP archives
```

#### config ops restore-config

```
config ops restore-config

Restore component configurations from backup. Imports ConfigMaps, Secrets, logs, and state files for a running deployment.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --input-dir           Path to the directory where     [string]                  
                           the command context will be                               
                           loaded from                                               
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### config ops restore-clusters

```
config ops restore-clusters

Restore Kind clusters from backup directory structure. Creates clusters, sets up Docker network, installs MetalLB, and initializes cluster configurations. Does not deploy network components.

Options:

     --input-dir           Path to the directory where     [string] [required]                               
                           the command context will be                                                       
                           loaded from                                                                       
                                                                                                             
     --dev                 Enable developer mode           [boolean] [default: false]                        
     --force-port-forward  Force port forward to access    [boolean] [default: true]                         
                           the network services                                                              
     --metallb-config      Path pattern for MetalLB        [string] [default: "metallb-cluster-{index}.yaml"]
                           configuration YAML files                                                          
                           (supports {index} placeholder                                                     
                           for cluster number)                                                               
     --options-file        Path to YAML file containing    [string]                                          
                           component-specific deployment                                                     
                           options (consensus, block,                                                        
                           mirror, relay, explorer)                                                          
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                        
                           confirmation                                                                      
-v,  --version             Show version number             [boolean]                                         
     --zip-file            Path to the encrypted backup    [string]                                          
                           ZIP archive used during                                                           
                           restore                                                                           
     --zip-password        Password to encrypt generated   [string]                                          
                           backup ZIP archives
```

#### config ops restore-network

```
config ops restore-network

Deploy network components to existing clusters from backup. Deploys consensus nodes, block nodes, mirror nodes, explorers, and relay nodes. Requires clusters to be already created (use restore-clusters first).

Options:

     --input-dir           Path to the directory where     [string] [required]       
                           the command context will be                               
                           loaded from                                               
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --options-file        Path to YAML file containing    [string]                  
                           component-specific deployment                             
                           options (consensus, block,                                
                           mirror, relay, explorer)                                  
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
     --realm               Realm number. Requires          [number] [default: 0]     
                           network-node > v61.0 for                                  
                           non-zero values                                           
     --shard               Shard number. Requires          [number] [default: 0]     
                           network-node > v61.0 for                                  
                           non-zero values                                           
-v,  --version             Show version number             [boolean]
```

## block

```
block

Block Node operations for creating, modifying, and destroying resources. These commands require the presence of an existing deployment.

Commands:
  block node   Create, manage, or destroy block node instances. Operates on a single block node instance at a time.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### block node

```
block node

Create, manage, or destroy block node instances. Operates on a single block node instance at a time.

Commands:
  block node add               Creates and configures a new block node instance for the specified deployment using the specified Kubernetes cluster. The cluster must be accessible and attached to the specified deployment.
  block node destroy           Destroys a single block node instance in the specified deployment. Requires access to all Kubernetes clusters attached to the deployment.
  block node upgrade           Upgrades a single block node instance in the specified deployment. Requires access to all Kubernetes clusters attached to the deployment.
  block node add-external      Add an external block node for the specified deployment. You can specify the priority and consensus nodes to which to connect or use the default settings.
  block node delete-external   Deletes an external block node from the specified deployment.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### block node add

```
block node add

Creates and configures a new block node instance for the specified deployment using the specified Kubernetes cluster. The cluster must be accessible and attached to the specified deployment.

Options:

-d,  --deployment              The name the user will          [string] [required]          
                               reference locally to link to a                               
                               deployment                                                   
                                                                                            
     --block-node-chart-dir    Block node local chart          [string]                     
                               directory path (e.g.                                         
                               ~/hiero-block-node/charts)                                   
     --block-node-tss-overlay  Force-apply block-node TSS      [boolean] [default: false]   
                               values overlay when deploying                                
                               block nodes before consensus                                 
                               deployment sets tssEnabled in                                
                               remote config.                                               
     --chart-dir               Local chart directory path      [string]                     
                               (e.g. ~/solo-charts/charts)                                  
     --chart-version           Block nodes chart version       [string] [default: "v0.28.1"]
-c,  --cluster-ref             The cluster reference that      [string]                     
                               will be used for referencing                                 
                               the Kubernetes cluster and                                   
                               stored in the local and remote                               
                               configuration for the                                        
                               deployment.  For commands that                               
                               take multiple clusters they                                  
                               can be separated by commas.                                  
     --dev                     Enable developer mode           [boolean] [default: false]   
     --domain-name             Custom domain name              [string]                     
     --enable-ingress          enable ingress on the           [boolean] [default: false]   
                               component/pod                                                
     --force-port-forward      Force port forward to access    [boolean] [default: true]    
                               the network services                                         
     --image-tag               The Docker image tag to         [string]                     
                               override what is in the Helm                                 
                               Chart                                                        
     --priority-mapping        Configure block node priority   [string]                     
                               mapping. Unlisted nodes will                                 
                               not be routed to a block node                                
                               Default: all consensus nodes                                 
                               included, first node priority                                
                               is 2. Example:                                               
                               "priority-mapping                                            
                               node1=2,node2=1"                                             
-q,  --quiet-mode              Quiet mode, do not prompt for   [boolean] [default: false]   
                               confirmation                                                 
-t,  --release-tag             Release tag to be used (e.g.    [string] [default: "v0.71.0"]
                               v0.71.0)                                                     
-f,  --values-file             Comma separated chart values    [string]                     
                               file                                                         
-v,  --version                 Show version number             [boolean]
```

#### block node destroy

```
block node destroy

Destroys a single block node instance in the specified deployment. Requires access to all Kubernetes clusters attached to the deployment.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --chart-dir           Local chart directory path      [string]                  
                           (e.g. ~/solo-charts/charts)                               
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
     --dev                 Enable developer mode           [boolean] [default: false]
     --force               Force actions even if those     [boolean] [default: false]
                           can be skipped                                            
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --id                  The numeric identifier for the  [number]                  
                           component                                                 
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### block node upgrade

```
block node upgrade

Upgrades a single block node instance in the specified deployment. Requires access to all Kubernetes clusters attached to the deployment.

Options:

-d,  --deployment            The name the user will          [string] [required]       
                             reference locally to link to a                            
                             deployment                                                
                                                                                       
     --block-node-chart-dir  Block node local chart          [string]                  
                             directory path (e.g.                                      
                             ~/hiero-block-node/charts)                                
     --chart-dir             Local chart directory path      [string]                  
                             (e.g. ~/solo-charts/charts)                               
-c,  --cluster-ref           The cluster reference that      [string]                  
                             will be used for referencing                              
                             the Kubernetes cluster and                                
                             stored in the local and remote                            
                             configuration for the                                     
                             deployment.  For commands that                            
                             take multiple clusters they                               
                             can be separated by commas.                               
     --dev                   Enable developer mode           [boolean] [default: false]
     --force                 Force actions even if those     [boolean] [default: false]
                             can be skipped                                            
     --force-port-forward    Force port forward to access    [boolean] [default: true] 
                             the network services                                      
     --id                    The numeric identifier for the  [number]                  
                             component                                                 
-q,  --quiet-mode            Quiet mode, do not prompt for   [boolean] [default: false]
                             confirmation                                              
     --upgrade-version       Version to be used for the      [string]                  
                             upgrade                                                   
-f,  --values-file           Comma separated chart values    [string]                  
                             file                                                      
-v,  --version               Show version number             [boolean]
```

#### block node add-external

```
block node add-external

Add an external block node for the specified deployment. You can specify the priority and consensus nodes to which to connect or use the default settings.

Options:

     --address             Provide external block node     [string] [required]       
                           address (IP or domain), with                              
                           optional port (Default port:                              
                           40840) Examples: " --address                              
                           localhost:8080", " --address                              
                           192.0.0.1"                                                
-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --priority-mapping    Configure block node priority   [string]                  
                           mapping. Unlisted nodes will                              
                           not be routed to a block node                             
                           Default: all consensus nodes                              
                           included, first node priority                             
                           is 2. Example:                                            
                           "priority-mapping                                         
                           node1=2,node2=1"                                          
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### block node delete-external

```
block node delete-external

Deletes an external block node from the specified deployment.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
     --dev                 Enable developer mode           [boolean] [default: false]
     --force               Force actions even if those     [boolean] [default: false]
                           can be skipped                                            
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --id                  The numeric identifier for the  [number]                  
                           component                                                 
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

## cluster-ref

```
cluster-ref

Manages the relationship between Kubernetes context names and Solo cluster references which are an alias for a kubernetes context.

Commands:
  cluster-ref config   List, create, manage, and remove associations between Kubernetes contexts and Solo cluster references.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### cluster-ref config

```
cluster-ref config

List, create, manage, and remove associations between Kubernetes contexts and Solo cluster references.

Commands:
  cluster-ref config connect      Creates a new internal Solo cluster name to a Kubernetes context or maps a Kubernetes context to an existing internal Solo cluster reference
  cluster-ref config disconnect   Removes the Kubernetes context associated with an internal Solo cluster reference.
  cluster-ref config list         Lists the configured Kubernetes context to Solo cluster reference mappings.
  cluster-ref config info         Displays the status information and attached deployments for a given Solo cluster reference mapping.
  cluster-ref config setup        Setup cluster with shared components
  cluster-ref config reset        Uninstall shared components from cluster

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### cluster-ref config connect

```
cluster-ref config connect

Creates a new internal Solo cluster name to a Kubernetes context or maps a Kubernetes context to an existing internal Solo cluster reference

Options:

-c,  --cluster-ref         The cluster reference that      [string] [required]       
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
     --context             The Kubernetes context name to  [string] [required]       
                           be used                                                   
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### cluster-ref config disconnect

```
cluster-ref config disconnect

Removes the Kubernetes context associated with an internal Solo cluster reference.

Options:

-c,  --cluster-ref         The cluster reference that      [string] [required]       
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### cluster-ref config list

```
cluster-ref config list

Lists the configured Kubernetes context to Solo cluster reference mappings.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### cluster-ref config info

```
cluster-ref config info

Displays the status information and attached deployments for a given Solo cluster reference mapping.

Options:

-c,  --cluster-ref         The cluster reference that      [string] [required]       
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### cluster-ref config setup

```
cluster-ref config setup

Setup cluster with shared components

Options:

                                                                                                
     --chart-dir                Local chart directory path      [string]                        
                                (e.g. ~/solo-charts/charts)                                     
-c,  --cluster-ref              The cluster reference that      [string]                        
                                will be used for referencing                                    
                                the Kubernetes cluster and                                      
                                stored in the local and remote                                  
                                configuration for the                                           
                                deployment.  For commands that                                  
                                take multiple clusters they                                     
                                can be separated by commas.                                     
-s,  --cluster-setup-namespace  Cluster Setup Namespace         [string] [default: "solo-setup"]
     --dev                      Enable developer mode           [boolean] [default: false]      
     --force-port-forward       Force port forward to access    [boolean] [default: true]       
                                the network services                                            
     --minio                    Deploy minio operator           [boolean] [default: true]       
     --prometheus-stack         Deploy prometheus stack         [boolean] [default: false]      
-q,  --quiet-mode               Quiet mode, do not prompt for   [boolean] [default: false]      
                                confirmation                                                    
     --solo-chart-version       Solo testing chart version      [string] [default: "0.63.2"]    
-v,  --version                  Show version number             [boolean]
```

#### cluster-ref config reset

```
cluster-ref config reset

Uninstall shared components from cluster

Options:

-c,  --cluster-ref              The cluster reference that      [string] [required]             
                                will be used for referencing                                    
                                the Kubernetes cluster and                                      
                                stored in the local and remote                                  
                                configuration for the                                           
                                deployment.  For commands that                                  
                                take multiple clusters they                                     
                                can be separated by commas.                                     
                                                                                                
-s,  --cluster-setup-namespace  Cluster Setup Namespace         [string] [default: "solo-setup"]
     --dev                      Enable developer mode           [boolean] [default: false]      
     --force                    Force actions even if those     [boolean] [default: false]      
                                can be skipped                                                  
     --force-port-forward       Force port forward to access    [boolean] [default: true]       
                                the network services                                            
-q,  --quiet-mode               Quiet mode, do not prompt for   [boolean] [default: false]      
                                confirmation                                                    
-v,  --version                  Show version number             [boolean]
```

## consensus

```
consensus

Consensus Node operations for creating, modifying, and destroying resources. These commands require the presence of an existing deployment.

Commands:
  consensus network            Ledger/network wide consensus operations such as freeze, upgrade, and deploy. Operates on the entire ledger and all consensus node instances.
  consensus node               List, create, manage, or destroy consensus node instances. Operates on a single consensus node instance at a time.
  consensus state              List, download, and upload consensus node state backups to/from individual consensus node instances.
  consensus dev-node-add       Dev operations for adding consensus nodes.
  consensus dev-node-update    Dev operations for updating consensus nodes
  consensus dev-node-upgrade   Dev operations for upgrading consensus nodes
  consensus dev-node-delete    Dev operations for delete consensus nodes
  consensus dev-freeze         Dev operations for freezing consensus nodes

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### consensus network

```
consensus network

Ledger/network wide consensus operations such as freeze, upgrade, and deploy. Operates on the entire ledger and all consensus node instances.

Commands:
  consensus network deploy    Installs and configures all consensus nodes for the deployment.
  consensus network destroy   Removes all consensus network components from the deployment.
  consensus network freeze    Initiates a network freeze for scheduled maintenance or upgrades
  consensus network upgrade   Upgrades the software version running on all consensus nodes.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### consensus network deploy

```
consensus network deploy

Installs and configures all consensus nodes for the deployment.

Options:

-d,  --deployment                 The name the user will          [string] [required]                                      
                                  reference locally to link to a                                                           
                                  deployment                                                                               
                                                                                                                           
     --api-permission-properties  api-permission.properties file  [string] [default: "templates/api-permission.properties"]
                                  for node                                                                                 
     --app                        Testing app name                [string] [default: "HederaNode.jar"]                     
     --application-env            the application.env file for    [string] [default: "templates/application.env"]          
                                  the node provides environment                                                            
                                  variables to the                                                                         
                                  solo-container to be used when                                                           
                                  the hedera platform is started                                                           
     --application-properties     application.properties file     [string] [default: "templates/application.properties"]   
                                  for node                                                                                 
     --aws-bucket                 name of aws storage bucket      [string]                                                 
     --aws-bucket-prefix          path prefix of aws storage      [string]                                                 
                                  bucket                                                                                   
     --aws-bucket-region          name of aws bucket region       [string]                                                 
     --aws-endpoint               aws storage endpoint URL        [string]                                                 
     --aws-write-access-key       aws storage access key for      [string]                                                 
                                  write access                                                                             
     --aws-write-secrets          aws storage secret key for      [string]                                                 
                                  write access                                                                             
     --backup-bucket              name of bucket for backing up   [string]                                                 
                                  state files                                                                              
     --backup-endpoint            backup storage endpoint URL     [string]                                                 
     --backup-provider            backup storage service          [string] [default: "GCS"]                                
                                  provider, GCS or AWS                                                                     
     --backup-region              backup storage region           [string] [default: "us-central1"]                        
     --backup-write-access-key    backup storage access key for   [string]                                                 
                                  write access                                                                             
     --backup-write-secrets       backup storage secret key for   [string]                                                 
                                  write access                                                                             
     --bootstrap-properties       bootstrap.properties file for   [string] [default: "templates/bootstrap.properties"]     
                                  node                                                                                     
     --cache-dir                  Local cache directory           [string] [default: "~/.solo/cache"]           
-l,  --chain-id                   Chain ID                        [string] [default: "298"]                                
     --chart-dir                  Local chart directory path      [string]                                                 
                                  (e.g. ~/solo-charts/charts)                                                              
     --debug-node-alias           Enable default jvm debug port   [string]                                                 
                                  (5005) for the given node id                                                             
     --dev                        Enable developer mode           [boolean] [default: false]                               
     --domain-names               Custom domain names for         [string]                                                 
                                  consensus nodes mapping for                                                              
                                  the(e.g. node0=domain.name                                                               
                                  where key is node alias and                                                              
                                  value is domain name)with                                                                
                                  multiple nodes comma separated                                                           
     --enable-monitoring-support  Enables CRDs for Prometheus     [boolean] [default: true]                                
                                  and Grafana.                                                                             
     --envoy-ips                  IP mapping where key = value    [string]                                                 
                                  is node alias and static ip                                                              
                                  for envoy proxy, (e.g.:                                                                  
                                  --envoy-ips                                                                              
                                  node1=127.0.0.1,node2=127.0.0.1)                                                           
     --force-port-forward         Force port forward to access    [boolean] [default: true]                                
                                  the network services                                                                     
     --gcs-bucket                 name of gcs storage bucket      [string]                                                 
     --gcs-bucket-prefix          path prefix of google storage   [string]                                                 
                                  bucket                                                                                   
     --gcs-endpoint               gcs storage endpoint URL        [string]                                                 
     --gcs-write-access-key       gcs storage access key for      [string]                                                 
                                  write access                                                                             
     --gcs-write-secrets          gcs storage secret key for      [string]                                                 
                                  write access                                                                             
     --genesis-throttles-fil
```

#### consensus network destroy

```
consensus network destroy

Removes all consensus network components from the deployment.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --delete-pvcs         Delete the persistent volume    [boolean] [default: false]
                           claims. If both  --delete-pvcs                            
                            and  --delete-secrets  are                               
                           set to true, the namespace                                
                           will be deleted.                                          
     --delete-secrets      Delete the network secrets. If  [boolean] [default: false]
                           both  --delete-pvcs  and                                  
                           --delete-secrets  are set to                              
                           true, the namespace will be                               
                           deleted.                                                  
     --dev                 Enable developer mode           [boolean] [default: false]
     --enable-timeout      enable time out for running a   [boolean] [default: false]
                           command                                                   
     --force               Force actions even if those     [boolean] [default: false]
                           can be skipped                                            
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### consensus network freeze

```
consensus network freeze

Initiates a network freeze for scheduled maintenance or upgrades

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### consensus network upgrade

```
consensus network upgrade

Upgrades the software version running on all consensus nodes.

Options:

-d,  --deployment                 The name the user will          [string] [required]                                      
                                  reference locally to link to a                                                           
                                  deployment                                                                               
                                                                                                                           
     --api-permission-properties  api-permission.properties file  [string] [default: "templates/api-permission.properties"]
                                  for node                                                                                 
     --app                        Testing app name                [string] [default: "HederaNode.jar"]                     
     --application-env            the application.env file for    [string] [default: "templates/application.env"]          
                                  the node provides environment                                                            
                                  variables to the                                                                         
                                  solo-container to be used when                                                           
                                  the hedera platform is started                                                           
     --application-properties     application.properties file     [string] [default: "templates/application.properties"]   
                                  for node                                                                                 
     --bootstrap-properties       bootstrap.properties file for   [string] [default: "templates/bootstrap.properties"]     
                                  node                                                                                     
     --cache-dir                  Local cache directory           [string] [default: "~/.solo/cache"]           
     --chart-dir                  Local chart directory path      [string]                                                 
                                  (e.g. ~/solo-charts/charts)                                                              
     --debug-node-alias           Enable default jvm debug port   [string]                                                 
                                  (5005) for the given node id                                                             
     --dev                        Enable developer mode           [boolean] [default: false]                               
     --force                      Force actions even if those     [boolean] [default: false]                               
                                  can be skipped                                                                           
     --force-port-forward         Force port forward to access    [boolean] [default: true]                                
                                  the network services                                                                     
     --local-build-path           path of hedera local repo       [string]                                                 
     --log4j2-xml                 log4j2.xml file for node        [string] [default: "templates/log4j2.xml"]               
-i,  --node-aliases               Comma separated node aliases    [string]                                                 
                                  (empty means all nodes)                                                                  
-q,  --quiet-mode                 Quiet mode, do not prompt for   [boolean] [default: false]                               
                                  confirmation                                                                             
     --settings-txt               settings.txt file for node      [string] [default: "templates/settings.txt"]             
     --solo-chart-version         Solo testing chart version      [string] [default: "0.63.2"]                             
     --upgrade-version            Version to be used for the      [string]                                                 
                                  upgrade                                                                                  
     --upgrade-zip-file           A zipped file used for network  [string]                                                 
                                  upgrade                                                                                  
-f,  --values-file                Comma separated chart values    [string]                                                 
                                  file paths for each cluster                                                              
                                  (e.g.                                                                                    
                                  values.yaml,cluster-1=./a/b/values1.yaml,cluster-2=./a/b/values2.yaml)                                                           
-v,  --version                    Show version number             [boolean]                                                
     --wraps-key-path             Path to a local directory       [string]                                                 
                                  containing pre-existing WRAPs                                                            
                                  proving key files (.bin)
```

### consensus node

```
consensus node

List, create, manage, or destroy consensus node instances. Operates on a single consensus node instance at a time.

Commands:
  consensus node setup         Setup node with a specific version of Hedera platform
  consensus node start         Start a node
  consensus node stop          Stop a node
  consensus node restart       Restart all nodes of the network
  consensus node refresh       Reset and restart a node
  consensus node add           Adds a node with a specific version of Hedera platform
  consensus node update        Update a node with a specific version of Hedera platform
  consensus node destroy       Delete a node with a specific version of Hedera platform
  consensus node collect-jfr   Collect Java Flight Recorder (JFR) files from a node for diagnostics and performance analysis. Requires the node to be running with Java Flight Recorder enabled.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### consensus node setup

```
consensus node setup

Setup node with a specific version of Hedera platform

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
                                                                                                         
     --admin-public-keys   Comma separated list of DER     [string]                                      
                           encoded ED25519 public keys                                                   
                           and must match the order of                                                   
                           the node aliases                                                              
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --app-config          json config file of testing     [string]                                      
                           app                                                                           
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --domain-names        Custom domain names for         [string]                                      
                           consensus nodes mapping for                                                   
                           the(e.g. node0=domain.name                                                    
                           where key is node alias and                                                   
                           value is domain name)with                                                     
                           multiple nodes comma separated                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --local-build-path    path of hedera local repo       [string]                                      
-i,  --node-aliases        Comma separated node aliases    [string]                                      
                           (empty means all nodes)                                                       
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
-t,  --release-tag         Release tag to be used (e.g.    [string] [default: "v0.71.0"]                 
                           v0.71.0)                                                                      
-v,  --version             Show version number             [boolean]
```

#### consensus node start

```
consensus node start

Start a node

Options:

-d,  --deployment          The name the user will          [string] [required]                                                      
                           reference locally to link to a                                                                           
                           deployment                                                                                               
                                                                                                                                    
     --app                 Testing app name                [string] [default: "HederaNode.jar"]                                     
     --debug-node-alias    Enable default jvm debug port   [string]                                                                 
                           (5005) for the given node id                                                                             
     --dev                 Enable developer mode           [boolean] [default: false]                                               
     --force-port-forward  Force port forward to access    [boolean] [default: true]                                                
                           the network services                                                                                     
     --grpc-web-endpoints  Configure gRPC Web endpoints    [Format: <alias>=<address>[:<port>][,<alias>=<address>[:<port>]]][string]
                           mapping, comma separated                                                                                 
                           (Default port: 8080) (Aliases                                                                            
                           can be provided explicitly, or                                                                           
                           inferred by node id order)                                                                               
                           Examples:                                                                                                
                           node1=127.0.0.1:8080,node2=127.0.0.1:8081 node1=localhost,node2=localhost:8081 localhost,127.0.0.2:8081                                                                           
-i,  --node-aliases        Comma separated node aliases    [string]                                                                 
                           (empty means all nodes)                                                                                  
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                                               
                           confirmation                                                                                             
     --stake-amounts       The amount to be staked in the  [string]                                                                 
                           same order you list the node                                                                             
                           aliases with multiple node                                                                               
                           staked values comma separated                                                                            
     --state-file          A zipped state file to be used  [string]                                                                 
                           for the network                                                                                          
-v,  --version             Show version number             [boolean]                                                                
     --wraps-key-path      Path to a local directory       [string]                                                                 
                           containing pre-existing WRAPs                                                                            
                           proving key files (.bin)
```

#### consensus node stop

```
consensus node stop

Stop a node

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-i,  --node-aliases        Comma separated node aliases    [string]                  
                           (empty means all nodes)                                   
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### consensus node restart

```
consensus node restart

Restart all nodes of the network

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]                 
     --wraps-key-path      Path to a local directory       [string]                  
                           containing pre-existing WRAPs                             
                           proving key files (.bin)
```

#### consensus node refresh

```
consensus node refresh

Reset and restart a node

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
                                                                                                         
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --domain-names        Custom domain names for         [string]                                      
                           consensus nodes mapping for                                                   
                           the(e.g. node0=domain.name                                                    
                           where key is node alias and                                                   
                           value is domain name)with                                                     
                           multiple nodes comma separated                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --local-build-path    path of hedera local repo       [string]                                      
-i,  --node-aliases        Comma separated node aliases    [string]                                      
                           (empty means all nodes)                                                       
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
-t,  --release-tag         Release tag to be used (e.g.    [string] [default: "v0.71.0"]                 
                           v0.71.0)                                                                      
-v,  --version             Show version number             [boolean]
```

#### consensus node add

```
consensus node add

Adds a node with a specific version of Hedera platform

Options:

-d,  --deployment                   The name the user will          [string] [required]                                                                                                   
                                    reference locally to link to a                                                                                                                        
                                    deployment                                                                                                                                            
                                                                                                                                                                                          
     --admin-key                    Admin key                       [string] [default: "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"]
     --app                          Testing app name                [string] [default: "HederaNode.jar"]                                                                                  
     --block-node-mapping           Configure block-node priority   [string]                                                                                                              
                                    mapping. Default: all                                                                                                                                 
                                    block-node included, first's                                                                                                                          
                                    priority is 2. Unlisted                                                                                                                               
                                    block-node will not routed to                                                                                                                         
                                    the consensus node node.                                                                                                                              
                                    Example:  --block-node-mapping                                                                                                                        
                                     1=2,2=1                                                                                                                                              
     --cache-dir                    Local cache directory           [string] [default: "~/.solo/cache"]                                                                        
-l,  --chain-id                     Chain ID                        [string] [default: "298"]                                                                                             
     --chart-dir                    Local chart directory path      [string]                                                                                                              
                                    (e.g. ~/solo-charts/charts)                                                                                                                           
-c,  --cluster-ref                  The cluster reference that      [string]                                                                                                              
                                    will be used for referencing                                                                                                                          
                                    the Kubernetes cluster and                                                                                                                            
                                    stored in the local and remote                                                                                                                        
                                    configuration for the                                                                                                                                 
                                    deployment.  For commands that                                                                                                                        
                                    take multiple clusters they                                                                                                                           
                                    can be separated by commas.                                                                                                                           
     --debug-node-alias             Enable default jvm debug port   [string]                                                                                                              
                                    (5005) for the given node id                                                                                                                          
     --dev                          Enable developer mode           [boolean] [default: false]                                                                                            
     --domain-names                 Custom domain names for         [string]                                                                                                              
                                    consensus nodes mapping for                                                                                                                           
                                    the(e.g. node0=domain.name                                                                                                                            
                                    where key is node alias and                                                                                                                           
                                    value is domain name)with                                                                                                                             
                                    multiple nodes comma separated                                                                                                                        
     --endpoint-type                Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                                                                                            
     --envoy-ips                    IP mapping where key = value    [string]                                                                                                              
                                    is node alias and static ip                                                                                                                           
                                    for envoy proxy, (e.g.:                                                                                                                               
                                    --envoy-ips                                                                                                                                           
                                    node1=127.0.0.1,node2=127.0.0.1)                                                                                                                        
     --external-block-node-mapping  Configure external-block-node   [string]                                                                                                              
                                    priority mapping. Default: all                                                                                                                        
                                    external-block-node includ
```

#### consensus node update

```
consensus node update

Update a node with a specific version of Hedera platform

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
     --node-alias          Node alias (e.g. node99)        [string] [required]                           
                                                                                                         
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
     --debug-node-alias    Enable default jvm debug port   [string]                                      
                           (5005) for the given node id                                                  
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --domain-names        Custom domain names for         [string]                                      
                           consensus nodes mapping for                                                   
                           the(e.g. node0=domain.name                                                    
                           where key is node alias and                                                   
                           value is domain name)with                                                     
                           multiple nodes comma separated                                                
     --endpoint-type       Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                    
     --force               Force actions even if those     [boolean] [default: false]                    
                           can be skipped                                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --gossip-endpoints    Comma separated gossip          [string]                                      
                           endpoints of the node(e.g.                                                    
                           first one is internal, second                                                 
                           one is external)                                                              
     --gossip-private-key  path and file name of the       [string]                                      
                           private key for signing gossip                                                
                           in PEM key format to be used                                                  
     --gossip-public-key   path and file name of the       [string]                                      
                           public key for signing gossip                                                 
                           in PEM key format to be used                                                  
     --grpc-endpoints      Comma separated gRPC endpoints  [string]                                      
                           of the node (at most 8)                                                       
     --local-build-path    path of hedera local repo       [string]                                      
     --new-account-number  new account number for node     [string]                                      
                           update transaction                                                            
     --new-admin-key       new admin key for the Hedera    [string]                                      
                           account                                                                       
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
-t,  --release-tag         Release tag to be used (e.g.    [string] [default: "v0.71.0"]                 
                           v0.71.0)                                                                      
     --solo-chart-version  Solo testing chart version      [string] [default: "0.63.2"]                  
     --tls-private-key     path and file name of the       [string]                                      
                           private TLS key to be used                                                    
     --tls-public-key      path and file name of the       [string]                                      
                           public TLS key to be used                                                     
-v,  --version             Show version number             [boolean]                                     
     --wraps-key-path      Path to a local directory       [string]                                      
                           containing pre-existing WRAPs                                                 
                           proving key files (.bin)
```

#### consensus node destroy

```
consensus node destroy

Delete a node with a specific version of Hedera platform

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
     --node-alias          Node alias (e.g. node99)        [string] [required]                           
                                                                                                         
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
-l,  --chain-id            Chain ID                        [string] [default: "298"]                     
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
     --debug-node-alias    Enable default jvm debug port   [string]                                      
                           (5005) for the given node id                                                  
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --domain-names        Custom domain names for         [string]                                      
                           consensus nodes mapping for                                                   
                           the(e.g. node0=domain.name                                                    
                           where key is node alias and                                                   
                           value is domain name)with                                                     
                           multiple nodes comma separated                                                
     --endpoint-type       Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                    
     --force               Force actions even if those     [boolean] [default: false]                    
                           can be skipped                                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --local-build-path    path of hedera local repo       [string]                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
-t,  --release-tag         Release tag to be used (e.g.    [string] [default: "v0.71.0"]                 
                           v0.71.0)                                                                      
     --solo-chart-version  Solo testing chart version      [string] [default: "0.63.2"]                  
-v,  --version             Show version number             [boolean]
```

#### consensus node collect-jfr

```
consensus node collect-jfr

Collect Java Flight Recorder (JFR) files from a node for diagnostics and performance analysis. Requires the node to be running with Java Flight Recorder enabled.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
     --node-alias          Node alias (e.g. node99)        [string] [required]       
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

### consensus state

```
consensus state

List, download, and upload consensus node state backups to/from individual consensus node instances.

Commands:
  consensus state download   Downloads a signed state from consensus node/nodes.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### consensus state download

```
consensus state download

Downloads a signed state from consensus node/nodes.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
-i,  --node-aliases        Comma separated node aliases    [string] [required]       
                           (empty means all nodes)                                   
                                                                                     
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

### consensus dev-node-add

```
consensus dev-node-add

Dev operations for adding consensus nodes.

Commands:
  consensus dev-node-add prepare               Prepares the addition of a node with a specific version of Hedera platform
  consensus dev-node-add submit-transactions   Submits NodeCreateTransaction and Upgrade transactions to the network nodes
  consensus dev-node-add execute               Executes the addition of a previously prepared node

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### consensus dev-node-add prepare

```
consensus dev-node-add prepare

Prepares the addition of a node with a specific version of Hedera platform

Options:

-d,  --deployment                   The name the user will          [string] [required]                                                                                                   
                                    reference locally to link to a                                                                                                                        
                                    deployment                                                                                                                                            
     --output-dir                   Path to the directory where     [string] [required]                                                                                                   
                                    the command context will be                                                                                                                           
                                    saved to                                                                                                                                              
                                                                                                                                                                                          
     --admin-key                    Admin key                       [string] [default: "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"]
     --app                          Testing app name                [string] [default: "HederaNode.jar"]                                                                                  
     --block-node-mapping           Configure block-node priority   [string]                                                                                                              
                                    mapping. Default: all                                                                                                                                 
                                    block-node included, first's                                                                                                                          
                                    priority is 2. Unlisted                                                                                                                               
                                    block-node will not routed to                                                                                                                         
                                    the consensus node node.                                                                                                                              
                                    Example:  --block-node-mapping                                                                                                                        
                                     1=2,2=1                                                                                                                                              
     --cache-dir                    Local cache directory           [string] [default: "~/.solo/cache"]                                                                        
-l,  --chain-id                     Chain ID                        [string] [default: "298"]                                                                                             
     --chart-dir                    Local chart directory path      [string]                                                                                                              
                                    (e.g. ~/solo-charts/charts)                                                                                                                           
-c,  --cluster-ref                  The cluster reference that      [string]                                                                                                              
                                    will be used for referencing                                                                                                                          
                                    the Kubernetes cluster and                                                                                                                            
                                    stored in the local and remote                                                                                                                        
                                    configuration for the                                                                                                                                 
                                    deployment.  For commands that                                                                                                                        
                                    take multiple clusters they                                                                                                                           
                                    can be separated by commas.                                                                                                                           
     --debug-node-alias             Enable default jvm debug port   [string]                                                                                                              
                                    (5005) for the given node id                                                                                                                          
     --dev                          Enable developer mode           [boolean] [default: false]                                                                                            
     --domain-names                 Custom domain names for         [string]                                                                                                              
                                    consensus nodes mapping for                                                                                                                           
                                    the(e.g. node0=domain.name                                                                                                                            
                                    where key is node alias and                                                                                                                           
                                    value is domain name)with                                                                                                                             
                                    multiple nodes comma separated                                                                                                                        
     --endpoint-type                Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                                                                                            
     --external-block-node-mapping  Configure external-block-node   [string]                                                                                                              
                                    priority mapping. Default: all                                                                                                                        
                                    external-block-node included,                                                                                                                         
                                    first's priority is 2.
```

#### consensus dev-node-add submit-transactions

```
consensus dev-node-add submit-transactions

Submits NodeCreateTransaction and Upgrade transactions to the network nodes

Options:

-d,  --deployment                   The name the user will          [string] [required]                           
                                    reference locally to link to a                                                
                                    deployment                                                                    
     --input-dir                    Path to the directory where     [string] [required]                           
                                    the command context will be                                                   
                                    loaded from                                                                   
                                                                                                                  
     --app                          Testing app name                [string] [default: "HederaNode.jar"]          
     --block-node-mapping           Configure block-node priority   [string]                                      
                                    mapping. Default: all                                                         
                                    block-node included, first's                                                  
                                    priority is 2. Unlisted                                                       
                                    block-node will not routed to                                                 
                                    the consensus node node.                                                      
                                    Example:  --block-node-mapping                                                
                                     1=2,2=1                                                                      
     --cache-dir                    Local cache directory           [string] [default: "~/.solo/cache"]
-l,  --chain-id                     Chain ID                        [string] [default: "298"]                     
     --chart-dir                    Local chart directory path      [string]                                      
                                    (e.g. ~/solo-charts/charts)                                                   
-c,  --cluster-ref                  The cluster reference that      [string]                                      
                                    will be used for referencing                                                  
                                    the Kubernetes cluster and                                                    
                                    stored in the local and remote                                                
                                    configuration for the                                                         
                                    deployment.  For commands that                                                
                                    take multiple clusters they                                                   
                                    can be separated by commas.                                                   
     --debug-node-alias             Enable default jvm debug port   [string]                                      
                                    (5005) for the given node id                                                  
     --dev                          Enable developer mode           [boolean] [default: false]                    
     --domain-names                 Custom domain names for         [string]                                      
                                    consensus nodes mapping for                                                   
                                    the(e.g. node0=domain.name                                                    
                                    where key is node alias and                                                   
                                    value is domain name)with                                                     
                                    multiple nodes comma separated                                                
     --endpoint-type                Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                    
     --external-block-node-mapping  Configure external-block-node   [string]                                      
                                    priority mapping. Default: all                                                
                                    external-block-node included,                                                 
                                    first's priority is 2.                                                        
                                    Unlisted external-block-node                                                  
                                    will not routed to the                                                        
                                    consensus node node. Example:                                                 
                                    --external-block-node-mapping                                                 
                                    1=2,2=1                                                                       
     --force                        Force actions even if those     [boolean] [default: false]                    
                                    can be skipped                                                                
     --force-port-forward           Force port forward to access    [boolean] [default: true]                     
                                    the network services                                                          
     --gossip-endpoints             Comma separated gossip          [string]                                      
                                    endpoints of the node(e.g.                                                    
                                    first one is internal, second                                                 
                                    one is external)                                                              
     --gossip-keys                  Generate gossip keys for nodes  [boolean] [default: false]                    
     --grpc-endpoints               Comma separated gRPC endpoints  [string]                                      
                                    of the node (at most 8)                                                       
     --grpc-tls-cert                TLS Certificate path for the    [string]                                      
                                    gRPC (e.g.                                                                    
                                    "node1=/Users/username/node1-grpc.cert" with multiple nodes comma separated)                                                
     --grpc-tls-key                 TLS Certificate key path for    [string]                                      
                                    the gRPC (e.g.                                                                
                                    "node1=/Users/username/node1-grpc.key" with multiple nodes comma separated)                                                
     --grpc-web-endpoint            Configure gRPC Web endpoint     [Format: <address>[:<port>]]  [string]        
                                    (Default port: 8080)                                                          
     --grpc-web-tls-cert            TLS Certificate path for gRPC   [string]                                      
                                    Web (e.g.                                                                     
                                    "node1=/Users/username/node1-grpc-web.cert" with multiple nodes comma separated)
```

#### consensus dev-node-add execute

```
consensus dev-node-add execute

Executes the addition of a previously prepared node

Options:

-d,  --deployment                   The name the user will          [string] [required]                                                                                                   
                                    reference locally to link to a                                                                                                                        
                                    deployment                                                                                                                                            
     --input-dir                    Path to the directory where     [string] [required]                                                                                                   
                                    the command context will be                                                                                                                           
                                    loaded from                                                                                                                                           
                                                                                                                                                                                          
     --admin-key                    Admin key                       [string] [default: "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"]
     --app                          Testing app name                [string] [default: "HederaNode.jar"]                                                                                  
     --block-node-mapping           Configure block-node priority   [string]                                                                                                              
                                    mapping. Default: all                                                                                                                                 
                                    block-node included, first's                                                                                                                          
                                    priority is 2. Unlisted                                                                                                                               
                                    block-node will not routed to                                                                                                                         
                                    the consensus node node.                                                                                                                              
                                    Example:  --block-node-mapping                                                                                                                        
                                     1=2,2=1                                                                                                                                              
     --cache-dir                    Local cache directory           [string] [default: "~/.solo/cache"]                                                                        
-l,  --chain-id                     Chain ID                        [string] [default: "298"]                                                                                             
     --chart-dir                    Local chart directory path      [string]                                                                                                              
                                    (e.g. ~/solo-charts/charts)                                                                                                                           
-c,  --cluster-ref                  The cluster reference that      [string]                                                                                                              
                                    will be used for referencing                                                                                                                          
                                    the Kubernetes cluster and                                                                                                                            
                                    stored in the local and remote                                                                                                                        
                                    configuration for the                                                                                                                                 
                                    deployment.  For commands that                                                                                                                        
                                    take multiple clusters they                                                                                                                           
                                    can be separated by commas.                                                                                                                           
     --debug-node-alias             Enable default jvm debug port   [string]                                                                                                              
                                    (5005) for the given node id                                                                                                                          
     --dev                          Enable developer mode           [boolean] [default: false]                                                                                            
     --domain-names                 Custom domain names for         [string]                                                                                                              
                                    consensus nodes mapping for                                                                                                                           
                                    the(e.g. node0=domain.name                                                                                                                            
                                    where key is node alias and                                                                                                                           
                                    value is domain name)with                                                                                                                             
                                    multiple nodes comma separated                                                                                                                        
     --endpoint-type                Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                                                                                            
     --envoy-ips                    IP mapping where key = value    [string]                                                                                                              
                                    is node alias and static ip                                                                                                                           
                                    for envoy proxy, (e.g.:                                                                                                                               
                                    --envoy-ips                                                                                                                                           
                                    node1=127.0.0.1,nod
```

### consensus dev-node-update

```
consensus dev-node-update

Dev operations for updating consensus nodes

Commands:
  consensus dev-node-update prepare               Prepare the deployment to update a node with a specific version of Hedera platform
  consensus dev-node-update submit-transactions   Submit transactions for updating a node with a specific version of Hedera platform
  consensus dev-node-update execute               Executes the updating of a node with a specific version of Hedera platform

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### consensus dev-node-update prepare

```
consensus dev-node-update prepare

Prepare the deployment to update a node with a specific version of Hedera platform

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
     --node-alias          Node alias (e.g. node99)        [string] [required]                           
     --output-dir          Path to the directory where     [string] [required]                           
                           the command context will be                                                   
                           saved to                                                                      
                                                                                                         
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
     --debug-node-alias    Enable default jvm debug port   [string]                                      
                           (5005) for the given node id                                                  
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --domain-names        Custom domain names for         [string]                                      
                           consensus nodes mapping for                                                   
                           the(e.g. node0=domain.name                                                    
                           where key is node alias and                                                   
                           value is domain name)with                                                     
                           multiple nodes comma separated                                                
     --endpoint-type       Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                    
     --force               Force actions even if those     [boolean] [default: false]                    
                           can be skipped                                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --gossip-endpoints    Comma separated gossip          [string]                                      
                           endpoints of the node(e.g.                                                    
                           first one is internal, second                                                 
                           one is external)                                                              
     --gossip-private-key  path and file name of the       [string]                                      
                           private key for signing gossip                                                
                           in PEM key format to be used                                                  
     --gossip-public-key   path and file name of the       [string]                                      
                           public key for signing gossip                                                 
                           in PEM key format to be used                                                  
     --grpc-endpoints      Comma separated gRPC endpoints  [string]                                      
                           of the node (at most 8)                                                       
     --local-build-path    path of hedera local repo       [string]                                      
     --new-account-number  new account number for node     [string]                                      
                           update transaction                                                            
     --new-admin-key       new admin key for the Hedera    [string]                                      
                           account                                                                       
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
-t,  --release-tag         Release tag to be used (e.g.    [string] [default: "v0.71.0"]                 
                           v0.71.0)                                                                      
     --solo-chart-version  Solo testing chart version      [string] [default: "0.63.2"]                  
     --tls-private-key     path and file name of the       [string]                                      
                           private TLS key to be used                                                    
     --tls-public-key      path and file name of the       [string]                                      
                           public TLS key to be used                                                     
-v,  --version             Show version number             [boolean]                                     
     --wraps-key-path      Path to a local directory       [string]                                      
                           containing pre-existing WRAPs                                                 
                           proving key files (.bin)
```

#### consensus dev-node-update submit-transactions

```
consensus dev-node-update submit-transactions

Submit transactions for updating a node with a specific version of Hedera platform

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
     --input-dir           Path to the directory where     [string] [required]                           
                           the command context will be                                                   
                           loaded from                                                                   
                                                                                                         
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
     --debug-node-alias    Enable default jvm debug port   [string]                                      
                           (5005) for the given node id                                                  
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --domain-names        Custom domain names for         [string]                                      
                           consensus nodes mapping for                                                   
                           the(e.g. node0=domain.name                                                    
                           where key is node alias and                                                   
                           value is domain name)with                                                     
                           multiple nodes comma separated                                                
     --endpoint-type       Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                    
     --force               Force actions even if those     [boolean] [default: false]                    
                           can be skipped                                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --gossip-endpoints    Comma separated gossip          [string]                                      
                           endpoints of the node(e.g.                                                    
                           first one is internal, second                                                 
                           one is external)                                                              
     --grpc-endpoints      Comma separated gRPC endpoints  [string]                                      
                           of the node (at most 8)                                                       
     --local-build-path    path of hedera local repo       [string]                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
-t,  --release-tag         Release tag to be used (e.g.    [string] [default: "v0.71.0"]                 
                           v0.71.0)                                                                      
     --solo-chart-version  Solo testing chart version      [string] [default: "0.63.2"]                  
-v,  --version             Show version number             [boolean]                                     
     --wraps-key-path      Path to a local directory       [string]                                      
                           containing pre-existing WRAPs                                                 
                           proving key files (.bin)
```

#### consensus dev-node-update execute

```
consensus dev-node-update execute

Executes the updating of a node with a specific version of Hedera platform

Options:

-d,  --deployment          The name the user will          [string] [required]                                                                                                   
                           reference locally to link to a                                                                                                                        
                           deployment                                                                                                                                            
     --input-dir           Path to the directory where     [string] [required]                                                                                                   
                           the command context will be                                                                                                                           
                           loaded from                                                                                                                                           
                                                                                                                                                                                 
     --admin-key           Admin key                       [string] [default: "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"]
     --app                 Testing app name                [string] [default: "HederaNode.jar"]                                                                                  
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]                                                                        
     --chart-dir           Local chart directory path      [string]                                                                                                              
                           (e.g. ~/solo-charts/charts)                                                                                                                           
     --debug-node-alias    Enable default jvm debug port   [string]                                                                                                              
                           (5005) for the given node id                                                                                                                          
     --dev                 Enable developer mode           [boolean] [default: false]                                                                                            
     --domain-names        Custom domain names for         [string]                                                                                                              
                           consensus nodes mapping for                                                                                                                           
                           the(e.g. node0=domain.name                                                                                                                            
                           where key is node alias and                                                                                                                           
                           value is domain name)with                                                                                                                             
                           multiple nodes comma separated                                                                                                                        
     --endpoint-type       Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                                                                                            
     --force               Force actions even if those     [boolean] [default: false]                                                                                            
                           can be skipped                                                                                                                                        
     --force-port-forward  Force port forward to access    [boolean] [default: true]                                                                                             
                           the network services                                                                                                                                  
     --gossip-endpoints    Comma separated gossip          [string]                                                                                                              
                           endpoints of the node(e.g.                                                                                                                            
                           first one is internal, second                                                                                                                         
                           one is external)                                                                                                                                      
     --grpc-endpoints      Comma separated gRPC endpoints  [string]                                                                                                              
                           of the node (at most 8)                                                                                                                               
     --local-build-path    path of hedera local repo       [string]                                                                                                              
     --new-account-number  new account number for node     [string]                                                                                                              
                           update transaction                                                                                                                                    
     --new-admin-key       new admin key for the Hedera    [string]                                                                                                              
                           account                                                                                                                                               
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                                                                                            
                           confirmation                                                                                                                                          
-t,  --release-tag         Release tag to be used (e.g.    [string] [default: "v0.71.0"]                                                                                         
                           v0.71.0)                                                                                                                                              
     --solo-chart-version  Solo testing chart version      [string] [default: "0.63.2"]                                                                                          
-v,  --version             Show version number             [boolean]                                                                                                             
     --wraps-key-path      Path to a local directory       [string]                                                                                                              
                           containing pre-existing WRAPs                                                                                                                         
                           proving key files (.bin)
```

### consensus dev-node-upgrade

```
consensus dev-node-upgrade

Dev operations for upgrading consensus nodes

Commands:
  consensus dev-node-upgrade prepare               Prepare for upgrading network
  consensus dev-node-upgrade submit-transactions   Submit transactions for upgrading network
  consensus dev-node-upgrade execute               Executes the upgrading the network

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### consensus dev-node-upgrade prepare

```
consensus dev-node-upgrade prepare

Prepare for upgrading network

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
     --output-dir          Path to the directory where     [string] [required]                           
                           the command context will be                                                   
                           saved to                                                                      
                                                                                                         
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
     --debug-node-alias    Enable default jvm debug port   [string]                                      
                           (5005) for the given node id                                                  
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --force               Force actions even if those     [boolean] [default: false]                    
                           can be skipped                                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --local-build-path    path of hedera local repo       [string]                                      
-i,  --node-aliases        Comma separated node aliases    [string]                                      
                           (empty means all nodes)                                                       
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
     --solo-chart-version  Solo testing chart version      [string] [default: "0.63.2"]                  
     --upgrade-zip-file    A zipped file used for network  [string]                                      
                           upgrade                                                                       
-v,  --version             Show version number             [boolean]
```

#### consensus dev-node-upgrade submit-transactions

```
consensus dev-node-upgrade submit-transactions

Submit transactions for upgrading network

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
     --input-dir           Path to the directory where     [string] [required]                           
                           the command context will be                                                   
                           loaded from                                                                   
                                                                                                         
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
     --debug-node-alias    Enable default jvm debug port   [string]                                      
                           (5005) for the given node id                                                  
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --force               Force actions even if those     [boolean] [default: false]                    
                           can be skipped                                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --local-build-path    path of hedera local repo       [string]                                      
-i,  --node-aliases        Comma separated node aliases    [string]                                      
                           (empty means all nodes)                                                       
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
     --solo-chart-version  Solo testing chart version      [string] [default: "0.63.2"]                  
     --upgrade-zip-file    A zipped file used for network  [string]                                      
                           upgrade                                                                       
-v,  --version             Show version number             [boolean]
```

#### consensus dev-node-upgrade execute

```
consensus dev-node-upgrade execute

Executes the upgrading the network

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
     --input-dir           Path to the directory where     [string] [required]                           
                           the command context will be                                                   
                           loaded from                                                                   
                                                                                                         
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
     --debug-node-alias    Enable default jvm debug port   [string]                                      
                           (5005) for the given node id                                                  
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --force               Force actions even if those     [boolean] [default: false]                    
                           can be skipped                                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --local-build-path    path of hedera local repo       [string]                                      
-i,  --node-aliases        Comma separated node aliases    [string]                                      
                           (empty means all nodes)                                                       
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
     --solo-chart-version  Solo testing chart version      [string] [default: "0.63.2"]                  
     --upgrade-zip-file    A zipped file used for network  [string]                                      
                           upgrade                                                                       
-v,  --version             Show version number             [boolean]
```

### consensus dev-node-delete

```
consensus dev-node-delete

Dev operations for delete consensus nodes

Commands:
  consensus dev-node-delete prepare               Prepares the deletion of a node with a specific version of Hedera platform
  consensus dev-node-delete submit-transactions   Submits transactions to the network nodes for deleting a node
  consensus dev-node-delete execute               Executes the deletion of a previously prepared node

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### consensus dev-node-delete prepare

```
consensus dev-node-delete prepare

Prepares the deletion of a node with a specific version of Hedera platform

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
     --node-alias          Node alias (e.g. node99)        [string] [required]                           
     --output-dir          Path to the directory where     [string] [required]                           
                           the command context will be                                                   
                           saved to                                                                      
                                                                                                         
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
-l,  --chain-id            Chain ID                        [string] [default: "298"]                     
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
     --debug-node-alias    Enable default jvm debug port   [string]                                      
                           (5005) for the given node id                                                  
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --domain-names        Custom domain names for         [string]                                      
                           consensus nodes mapping for                                                   
                           the(e.g. node0=domain.name                                                    
                           where key is node alias and                                                   
                           value is domain name)with                                                     
                           multiple nodes comma separated                                                
     --endpoint-type       Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                    
     --force               Force actions even if those     [boolean] [default: false]                    
                           can be skipped                                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --local-build-path    path of hedera local repo       [string]                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
-t,  --release-tag         Release tag to be used (e.g.    [string] [default: "v0.71.0"]                 
                           v0.71.0)                                                                      
     --solo-chart-version  Solo testing chart version      [string] [default: "0.63.2"]                  
-v,  --version             Show version number             [boolean]
```

#### consensus dev-node-delete submit-transactions

```
consensus dev-node-delete submit-transactions

Submits transactions to the network nodes for deleting a node

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
     --input-dir           Path to the directory where     [string] [required]                           
                           the command context will be                                                   
                           loaded from                                                                   
     --node-alias          Node alias (e.g. node99)        [string] [required]                           
                                                                                                         
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
-l,  --chain-id            Chain ID                        [string] [default: "298"]                     
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
     --debug-node-alias    Enable default jvm debug port   [string]                                      
                           (5005) for the given node id                                                  
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --domain-names        Custom domain names for         [string]                                      
                           consensus nodes mapping for                                                   
                           the(e.g. node0=domain.name                                                    
                           where key is node alias and                                                   
                           value is domain name)with                                                     
                           multiple nodes comma separated                                                
     --endpoint-type       Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                    
     --force               Force actions even if those     [boolean] [default: false]                    
                           can be skipped                                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --local-build-path    path of hedera local repo       [string]                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
-t,  --release-tag         Release tag to be used (e.g.    [string] [default: "v0.71.0"]                 
                           v0.71.0)                                                                      
     --solo-chart-version  Solo testing chart version      [string] [default: "0.63.2"]                  
-v,  --version             Show version number             [boolean]
```

#### consensus dev-node-delete execute

```
consensus dev-node-delete execute

Executes the deletion of a previously prepared node

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
     --input-dir           Path to the directory where     [string] [required]                           
                           the command context will be                                                   
                           loaded from                                                                   
     --node-alias          Node alias (e.g. node99)        [string] [required]                           
                                                                                                         
     --app                 Testing app name                [string] [default: "HederaNode.jar"]          
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
-l,  --chain-id            Chain ID                        [string] [default: "298"]                     
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
     --debug-node-alias    Enable default jvm debug port   [string]                                      
                           (5005) for the given node id                                                  
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --domain-names        Custom domain names for         [string]                                      
                           consensus nodes mapping for                                                   
                           the(e.g. node0=domain.name                                                    
                           where key is node alias and                                                   
                           value is domain name)with                                                     
                           multiple nodes comma separated                                                
     --endpoint-type       Endpoint type (IP or FQDN)      [string] [default: "FQDN"]                    
     --force               Force actions even if those     [boolean] [default: false]                    
                           can be skipped                                                                
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --local-build-path    path of hedera local repo       [string]                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
-t,  --release-tag         Release tag to be used (e.g.    [string] [default: "v0.71.0"]                 
                           v0.71.0)                                                                      
     --solo-chart-version  Solo testing chart version      [string] [default: "0.63.2"]                  
-v,  --version             Show version number             [boolean]
```

### consensus dev-freeze

```
consensus dev-freeze

Dev operations for freezing consensus nodes

Commands:
  consensus dev-freeze prepare-upgrade   Prepare the network for a Freeze Upgrade operation
  consensus dev-freeze freeze-upgrade    Performs a Freeze Upgrade operation with on the network after it has been prepared with prepare-upgrade

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### consensus dev-freeze prepare-upgrade

```
consensus dev-freeze prepare-upgrade

Prepare the network for a Freeze Upgrade operation

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
                                                                                                         
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
     --skip-node-alias     The node alias to skip,         [string]                                      
                           because of a                                                                  
                           NodeUpdateTransaction or it is                                                
                           down (e.g. node99)                                                            
-v,  --version             Show version number             [boolean]
```

#### consensus dev-freeze freeze-upgrade

```
consensus dev-freeze freeze-upgrade

Performs a Freeze Upgrade operation with on the network after it has been prepared with prepare-upgrade

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
                                                                                                         
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
     --skip-node-alias     The node alias to skip,         [string]                                      
                           because of a                                                                  
                           NodeUpdateTransaction or it is                                                
                           down (e.g. node99)                                                            
-v,  --version             Show version number             [boolean]
```

## deployment

```
deployment

Create, modify, and delete deployment configurations. Deployments are required for most of the other commands.

Commands:
  deployment cluster       View and manage Solo cluster references used by a deployment.
  deployment config        List, view, create, delete, and import deployments. These commands affect the local configuration only.
  deployment refresh       Refresh port-forward processes for all components in the deployment.
  deployment diagnostics   Capture diagnostic information such as logs, signed states, and ledger/network/node configurations.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### deployment cluster

```
deployment cluster

View and manage Solo cluster references used by a deployment.

Commands:
  deployment cluster attach   Attaches a cluster reference to a deployment.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### deployment cluster attach

```
deployment cluster attach

Attaches a cluster reference to a deployment.

Options:

-c,  --cluster-ref                 The cluster reference that      [string] [required]                                          
                                   will be used for referencing                                                                 
                                   the Kubernetes cluster and                                                                   
                                   stored in the local and remote                                                               
                                   configuration for the                                                                        
                                   deployment.  For commands that                                                               
                                   take multiple clusters they                                                                  
                                   can be separated by commas.                                                                  
-d,  --deployment                  The name the user will          [string] [required]                                          
                                   reference locally to link to a                                                               
                                   deployment                                                                                   
                                                                                                                                
     --dev                         Enable developer mode           [boolean] [default: false]                                   
     --dns-base-domain             Base domain for the DNS is the  [string] [default: "cluster.local"]                          
                                   suffix used to construct the                                                                 
                                   fully qualified domain name                                                                  
                                   (FQDN)                                                                                       
     --dns-consensus-node-pattern  Pattern to construct the        [string] [default: "network-{nodeAlias}-svc.{namespace}.svc"]
                                   prefix for the fully qualified                                                               
                                   domain name (FQDN) for the                                                                   
                                   consensus node, the suffix is                                                                
                                   provided by the                                                                              
                                   --dns-base-domain  option (ex.                                                               
                                   network-{nodeAlias}-svc.{namespace}.svc)                                                               
     --enable-cert-manager         Pass the flag to enable cert    [boolean] [default: false]                                   
                                   manager                                                                                      
     --force-port-forward          Force port forward to access    [boolean] [default: true]                                    
                                   the network services                                                                         
     --num-consensus-nodes         Used to specify desired number  [number]                                                     
                                   of consensus nodes for                                                                       
                                   pre-genesis deployments                                                                      
-q,  --quiet-mode                  Quiet mode, do not prompt for   [boolean] [default: false]                                   
                                   confirmation                                                                                 
-v,  --version                     Show version number             [boolean]
```

### deployment config

```
deployment config

List, view, create, delete, and import deployments. These commands affect the local configuration only.

Commands:
  deployment config list     Lists all local deployment configurations or deployments in a specific cluster.
  deployment config create   Creates a new local deployment configuration.
  deployment config delete   Removes a local deployment configuration.
  deployment config info     Displays the full status of a deployment including components, versions, and port-forward status.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### deployment config list

```
deployment config list

Lists all local deployment configurations or deployments in a specific cluster.

Options:

                                                                                     
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### deployment config create

```
deployment config create

Creates a new local deployment configuration.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
-n,  --namespace           Namespace                       [string] [required]       
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
     --realm               Realm number. Requires          [number] [default: 0]     
                           network-node > v61.0 for                                  
                           non-zero values                                           
     --shard               Shard number. Requires          [number] [default: 0]     
                           network-node > v61.0 for                                  
                           non-zero values                                           
-v,  --version             Show version number             [boolean]
```

#### deployment config delete

```
deployment config delete

Removes a local deployment configuration.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### deployment config info

```
deployment config info

Displays the full status of a deployment including components, versions, and port-forward status.

Options:

                                                                                     
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
-d,  --deployment          The name the user will          [string]                  
                           reference locally to link to a                            
                           deployment                                                
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

### deployment refresh

```
deployment refresh

Refresh port-forward processes for all components in the deployment.

Commands:
  deployment refresh port-forwards   Refresh and restore killed port-forward processes.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### deployment refresh port-forwards

```
deployment refresh port-forwards

Refresh and restore killed port-forward processes.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

### deployment diagnostics

```
deployment diagnostics

Capture diagnostic information such as logs, signed states, and ledger/network/node configurations.

Commands:
  deployment diagnostics all           Captures logs, configs, and diagnostic artifacts from all consensus nodes and test connections.
  deployment diagnostics debug         Similar to diagnostics all subcommand, but creates a zip archive for easy sharing.
  deployment diagnostics connections   Tests connections to Consensus, Relay, Explorer, Mirror and Block nodes.
  deployment diagnostics logs          Get logs and configuration files from consensus node/nodes.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### deployment diagnostics all

```
deployment diagnostics all

Captures logs, configs, and diagnostic artifacts from all consensus nodes and test connections.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### deployment diagnostics debug

```
deployment diagnostics debug

Similar to diagnostics all subcommand, but creates a zip archive for easy sharing.

Options:

                                                                                     
-d,  --deployment          The name the user will          [string]                  
                           reference locally to link to a                            
                           deployment                                                
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --output-dir          Path to the directory where     [string]                  
                           the command context will be                               
                           saved to                                                  
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### deployment diagnostics connections

```
deployment diagnostics connections

Tests connections to Consensus, Relay, Explorer, Mirror and Block nodes.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### deployment diagnostics logs

```
deployment diagnostics logs

Get logs and configuration files from consensus node/nodes.

Options:

                                                                                     
-d,  --deployment          The name the user will          [string]                  
                           reference locally to link to a                            
                           deployment                                                
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --output-dir          Path to the directory where     [string]                  
                           the command context will be                               
                           saved to                                                  
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

## explorer

```
explorer

Explorer Node operations for creating, modifying, and destroying resources.These commands require the presence of an existing deployment.

Commands:
  explorer node   List, create, manage, or destroy explorer node instances. Operates on a single explorer node instance at a time.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### explorer node

```
explorer node

List, create, manage, or destroy explorer node instances. Operates on a single explorer node instance at a time.

Commands:
  explorer node add       Adds and configures a new node instance.
  explorer node destroy   Deletes the specified node from the deployment.
  explorer node upgrade   Upgrades the specified node in the deployment.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### explorer node add

```
explorer node add

Adds and configures a new node instance.

Options:

-d,  --deployment                     The name the user will          [string] [required]                           
                                      reference locally to link to a                                                
                                      deployment                                                                    
                                                                                                                    
     --cache-dir                      Local cache directory           [string] [default: "~/.solo/cache"]
     --chart-dir                      Local chart directory path      [string]                                      
                                      (e.g. ~/solo-charts/charts)                                                   
-c,  --cluster-ref                    The cluster reference that      [string]                                      
                                      will be used for referencing                                                  
                                      the Kubernetes cluster and                                                    
                                      stored in the local and remote                                                
                                      configuration for the                                                         
                                      deployment.  For commands that                                                
                                      take multiple clusters they                                                   
                                      can be separated by commas.                                                   
-s,  --cluster-setup-namespace        Cluster Setup Namespace         [string] [default: "solo-setup"]              
     --dev                            Enable developer mode           [boolean] [default: false]                    
     --domain-name                    Custom domain name              [string]                                      
     --enable-explorer-tls            Enable Explorer TLS, defaults   [boolean] [default: false]                    
                                      to false, requires certManager                                                
                                      and certManagerCrds, which can                                                
                                      be deployed through                                                           
                                      solo-cluster-setup chart or                                                   
                                      standalone                                                                    
     --enable-ingress                 enable ingress on the           [boolean] [default: false]                    
                                      component/pod                                                                 
     --explorer-chart-dir             Explorer local chart directory  [string]                                      
                                      path (e.g.                                                                    
                                      ~/hiero-mirror-node-explorer/charts)                                                
     --explorer-static-ip             The static IP address to use    [string]                                      
                                      for the Explorer load                                                         
                                      balancer, defaults to ""                                                      
     --explorer-tls-host-name         The host name to use for the    [string] [default: "explorer.solo.local"]     
                                      Explorer TLS, defaults to                                                     
                                      "explorer.solo.local"                                                         
     --explorer-version               Explorer chart version          [string] [default: "26.0.0"]                  
     --force-port-forward             Force port forward to access    [boolean] [default: true]                     
                                      the network services                                                          
     --ingress-controller-value-file  The value file to use for       [string]                                      
                                      ingress controller, defaults                                                  
                                      to ""                                                                         
     --mirror-namespace               Namespace to use for the        [string]                                      
                                      Mirror Node deployment, a new                                                 
                                      one will be created if it does                                                
                                      not exist                                                                     
     --mirror-node-id                 The id of the mirror node       [number]                                      
                                      which to connect                                                              
-n,  --namespace                      Namespace                       [string]                                      
-q,  --quiet-mode                     Quiet mode, do not prompt for   [boolean] [default: false]                    
                                      confirmation                                                                  
     --solo-chart-version             Solo testing chart version      [string] [default: "0.63.2"]                  
     --tls-cluster-issuer-type        The TLS cluster issuer type to  [string] [default: "self-signed"]             
                                      use for hedera explorer,                                                      
                                      defaults to "self-signed", the                                                
                                      available options are:                                                        
                                      "acme-staging", "acme-prod",                                                  
                                      or "self-signed"                                                              
-f,  --values-file                    Comma separated chart values    [string]                                      
                                      file                                                                          
-v,  --version                        Show version number             [boolean]
```

#### explorer node destroy

```
explorer node destroy

Deletes the specified node from the deployment.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --chart-dir           Local chart directory path      [string]                  
                           (e.g. ~/solo-charts/charts)                               
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
     --dev                 Enable developer mode           [boolean] [default: false]
     --force               Force actions even if those     [boolean] [default: false]
                           can be skipped                                            
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### explorer node upgrade

```
explorer node upgrade

Upgrades the specified node in the deployment.

Options:

-d,  --deployment                     The name the user will          [string] [required]                           
                                      reference locally to link to a                                                
                                      deployment                                                                    
                                                                                                                    
     --cache-dir                      Local cache directory           [string] [default: "~/.solo/cache"]
     --chart-dir                      Local chart directory path      [string]                                      
                                      (e.g. ~/solo-charts/charts)                                                   
-c,  --cluster-ref                    The cluster reference that      [string]                                      
                                      will be used for referencing                                                  
                                      the Kubernetes cluster and                                                    
                                      stored in the local and remote                                                
                                      configuration for the                                                         
                                      deployment.  For commands that                                                
                                      take multiple clusters they                                                   
                                      can be separated by commas.                                                   
-s,  --cluster-setup-namespace        Cluster Setup Namespace         [string] [default: "solo-setup"]              
     --dev                            Enable developer mode           [boolean] [default: false]                    
     --domain-name                    Custom domain name              [string]                                      
     --enable-explorer-tls            Enable Explorer TLS, defaults   [boolean] [default: false]                    
                                      to false, requires certManager                                                
                                      and certManagerCrds, which can                                                
                                      be deployed through                                                           
                                      solo-cluster-setup chart or                                                   
                                      standalone                                                                    
     --enable-ingress                 enable ingress on the           [boolean] [default: false]                    
                                      component/pod                                                                 
     --explorer-chart-dir             Explorer local chart directory  [string]                                      
                                      path (e.g.                                                                    
                                      ~/hiero-mirror-node-explorer/charts)                                                
     --explorer-static-ip             The static IP address to use    [string]                                      
                                      for the Explorer load                                                         
                                      balancer, defaults to ""                                                      
     --explorer-tls-host-name         The host name to use for the    [string] [default: "explorer.solo.local"]     
                                      Explorer TLS, defaults to                                                     
                                      "explorer.solo.local"                                                         
     --explorer-version               Explorer chart version          [string] [default: "26.0.0"]                  
     --force-port-forward             Force port forward to access    [boolean] [default: true]                     
                                      the network services                                                          
     --id                             The numeric identifier for the  [number]                                      
                                      component                                                                     
     --ingress-controller-value-file  The value file to use for       [string]                                      
                                      ingress controller, defaults                                                  
                                      to ""                                                                         
     --mirror-namespace               Namespace to use for the        [string]                                      
                                      Mirror Node deployment, a new                                                 
                                      one will be created if it does                                                
                                      not exist                                                                     
     --mirror-node-id                 The id of the mirror node       [number]                                      
                                      which to connect                                                              
-n,  --namespace                      Namespace                       [string]                                      
-q,  --quiet-mode                     Quiet mode, do not prompt for   [boolean] [default: false]                    
                                      confirmation                                                                  
     --solo-chart-version             Solo testing chart version      [string] [default: "0.63.2"]                  
     --tls-cluster-issuer-type        The TLS cluster issuer type to  [string] [default: "self-signed"]             
                                      use for hedera explorer,                                                      
                                      defaults to "self-signed", the                                                
                                      available options are:                                                        
                                      "acme-staging", "acme-prod",                                                  
                                      or "self-signed"                                                              
-f,  --values-file                    Comma separated chart values    [string]                                      
                                      file                                                                          
-v,  --version                        Show version number             [boolean]
```

## keys

```
keys

Consensus key generation operations

Commands:
  keys consensus   Generate unique cryptographic keys (gossip or grpc TLS keys) for the Consensus Node instances.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### keys consensus

```
keys consensus

Generate unique cryptographic keys (gossip or grpc TLS keys) for the Consensus Node instances.

Commands:
  keys consensus generate   Generates TLS keys required for consensus node communication.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### keys consensus generate

```
keys consensus generate

Generates TLS keys required for consensus node communication.

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
                                                                                                         
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --gossip-keys         Generate gossip keys for nodes  [boolean] [default: false]                    
-n,  --namespace           Namespace                       [string]                                      
-i,  --node-aliases        Comma separated node aliases    [string]                                      
                           (empty means all nodes)                                                       
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
     --tls-keys            Generate gRPC TLS keys for      [boolean] [default: false]                    
                           nodes                                                                         
-v,  --version             Show version number             [boolean]
```

## ledger

```
ledger

System, Account, and Crypto ledger-based management operations. These commands require an operational set of consensus nodes and may require an operational mirror node.

Commands:
  ledger system    Perform a full ledger initialization on a new deployment, rekey privileged/system accounts, or setup network staking parameters.
  ledger account   View, list, create, update, delete, and import ledger accounts.
  ledger file      Upload or update files on the Hiero network.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### ledger system

```
ledger system

Perform a full ledger initialization on a new deployment, rekey privileged/system accounts, or setup network staking parameters.

Commands:
  ledger system init   Re-keys ledger system accounts and consensus node admin keys with uniquely generated ED25519 private keys and will stake consensus nodes.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### ledger system init

```
ledger system init

Re-keys ledger system accounts and consensus node admin keys with uniquely generated ED25519 private keys and will stake consensus nodes.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-i,  --node-aliases        Comma separated node aliases    [string]                  
                           (empty means all nodes)                                   
-v,  --version             Show version number             [boolean]
```

### ledger account

```
ledger account

View, list, create, update, delete, and import ledger accounts.

Commands:
  ledger account update       Updates an existing ledger account.
  ledger account create       Creates a new ledger account.
  ledger account info         Gets the account info including the current amount of HBAR
  ledger account predefined   Creates predefined accounts used by one-shot deployments.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### ledger account update

```
ledger account update

Updates an existing ledger account.

Options:

     --account-id           The Hedera account id, e.g.:    [string] [required]       
                            0.0.1001                                                  
-d,  --deployment           The name the user will          [string] [required]       
                            reference locally to link to a                            
                            deployment                                                
                                                                                      
-c,  --cluster-ref          The cluster reference that      [string]                  
                            will be used for referencing                              
                            the Kubernetes cluster and                                
                            stored in the local and remote                            
                            configuration for the                                     
                            deployment.  For commands that                            
                            take multiple clusters they                               
                            can be separated by commas.                               
     --dev                  Enable developer mode           [boolean] [default: false]
     --ecdsa-private-key    Specify a hex-encoded ECDSA     [string]                  
                            private key for the Hedera                                
                            account                                                   
     --ed25519-private-key  Specify a hex-encoded ED25519   [string]                  
                            private key for the Hedera                                
                            account                                                   
     --force-port-forward   Force port forward to access    [boolean] [default: true] 
                            the network services                                      
     --hbar-amount          Amount of HBAR to add           [number] [default: 100]   
-v,  --version              Show version number             [boolean]
```

#### ledger account create

```
ledger account create

Creates a new ledger account.

Options:

-d,  --deployment           The name the user will          [string] [required]       
                            reference locally to link to a                            
                            deployment                                                
                                                                                      
-c,  --cluster-ref          The cluster reference that      [string]                  
                            will be used for referencing                              
                            the Kubernetes cluster and                                
                            stored in the local and remote                            
                            configuration for the                                     
                            deployment.  For commands that                            
                            take multiple clusters they                               
                            can be separated by commas.                               
     --create-amount        Amount of new account to        [number] [default: 1]     
                            create                                                    
     --dev                  Enable developer mode           [boolean] [default: false]
     --ecdsa-private-key    Specify a hex-encoded ECDSA     [string]                  
                            private key for the Hedera                                
                            account                                                   
     --ed25519-private-key  Specify a hex-encoded ED25519   [string]                  
                            private key for the Hedera                                
                            account                                                   
     --force-port-forward   Force port forward to access    [boolean] [default: true] 
                            the network services                                      
     --generate-ecdsa-key   Generate ECDSA private key for  [boolean] [default: false]
                            the Hedera account                                        
     --hbar-amount          Amount of HBAR to add           [number] [default: 100]   
     --private-key          Show private key information    [boolean] [default: false]
     --set-alias            Sets the alias for the Hedera   [boolean] [default: false]
                            account when it is created,                               
                            requires  --ecdsa-private-key                             
-v,  --version              Show version number             [boolean]
```

#### ledger account info

```
ledger account info

Gets the account info including the current amount of HBAR

Options:

     --account-id          The Hedera account id, e.g.:    [string] [required]       
                           0.0.1001                                                  
-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --private-key         Show private key information    [boolean] [default: false]
-v,  --version             Show version number             [boolean]
```

#### ledger account predefined

```
ledger account predefined

Creates predefined accounts used by one-shot deployments.

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
                                                                                                         
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
-c,  --cluster-ref         The cluster reference that      [string]                                      
                           will be used for referencing                                                  
                           the Kubernetes cluster and                                                    
                           stored in the local and remote                                                
                           configuration for the                                                         
                           deployment.  For commands that                                                
                           take multiple clusters they                                                   
                           can be separated by commas.                                                   
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
-v,  --version             Show version number             [boolean]
```

### ledger file

```
ledger file

Upload or update files on the Hiero network.

Commands:
  ledger file create   Create a new file on the Hiero network
  ledger file update   Update an existing file on the Hiero network

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### ledger file create

```
ledger file create

Create a new file on the Hiero network

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
     --file-path           Local path to the file to       [string] [required]       
                           upload                                                    
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### ledger file update

```
ledger file update

Update an existing file on the Hiero network

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
     --file-id             The network file id, e.g.:      [string] [required]       
                           0.0.150                                                   
     --file-path           Local path to the file to       [string] [required]       
                           upload                                                    
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

## mirror

```
mirror

Mirror Node operations for creating, modifying, and destroying resources. These commands require the presence of an existing deployment.

Commands:
  mirror node   List, create, manage, or destroy mirror node instances. Operates on a single mirror node instance at a time.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### mirror node

```
mirror node

List, create, manage, or destroy mirror node instances. Operates on a single mirror node instance at a time.

Commands:
  mirror node add       Adds and configures a new node instance.
  mirror node destroy   Deletes the specified node from the deployment.
  mirror node upgrade   Upgrades the specified node from the deployment.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### mirror node add

```
mirror node add

Adds and configures a new node instance.

Options:

-d,  --deployment                        The name the user will          [string] [required]                           
                                         reference locally to link to a                                                
                                         deployment                                                                    
                                                                                                                       
     --cache-dir                         Local cache directory           [string] [default: "~/.solo/cache"]
     --chart-dir                         Local chart directory path      [string]                                      
                                         (e.g. ~/solo-charts/charts)                                                   
-c,  --cluster-ref                       The cluster reference that      [string]                                      
                                         will be used for referencing                                                  
                                         the Kubernetes cluster and                                                    
                                         stored in the local and remote                                                
                                         configuration for the                                                         
                                         deployment.  For commands that                                                
                                         take multiple clusters they                                                   
                                         can be separated by commas.                                                   
     --dev                               Enable developer mode           [boolean] [default: false]                    
     --domain-name                       Custom domain name              [string]                                      
     --enable-ingress                    enable ingress on the           [boolean] [default: false]                    
                                         component/pod                                                                 
     --external-database-host            Use to provide the external     [string]                                      
                                         database host if the '                                                        
                                         --use-external-database ' is                                                  
                                         passed                                                                        
     --external-database-owner-password  Use to provide the external     [string]                                      
                                         database owner's password if                                                  
                                         the ' --use-external-database                                                 
                                         ' is passed                                                                   
     --external-database-owner-username  Use to provide the external     [string]                                      
                                         database owner's username if                                                  
                                         the ' --use-external-database                                                 
                                         ' is passed                                                                   
     --external-database-read-password   Use to provide the external     [string]                                      
                                         database readonly user's                                                      
                                         password if the '                                                             
                                         --use-external-database ' is                                                  
                                         passed                                                                        
     --external-database-read-username   Use to provide the external     [string]                                      
                                         database readonly user's                                                      
                                         username if the '                                                             
                                         --use-external-database ' is                                                  
                                         passed                                                                        
     --force                             Force enable block node         [boolean] [default: false]                    
                                         integration bypassing the                                                     
                                         version requirements CN >=                                                    
                                         v0.72.0, BN >= 0.29.0, CN >=                                                  
                                         0.150.0                                                                       
     --force-port-forward                Force port forward to access    [boolean] [default: true]                     
                                         the network services                                                          
     --ingress-controller-value-file     The value file to use for       [string]                                      
                                         ingress controller, defaults                                                  
                                         to ""                                                                         
     --mirror-node-chart-dir             Mirror node local chart         [string]                                      
                                         directory path (e.g.                                                          
                                         ~/hiero-mirror-node/charts)                                                   
     --mirror-node-version               Mirror node chart version       [string] [default: "v0.151.0"]                
     --mirror-static-ip                  static IP address for the       [string]                                      
                                         mirror node                                                                   
     --operator-id                       Operator ID                     [string]                                      
     --operator-key                      Operator Key                    [string]                                      
     --pinger                            Enable Pinger service in the    [boolean] [default: false]                    
                                         Mirror node monitor                                                           
-q,  --quiet-mode                        Quiet mode, do not prompt for   [boolean] [default: false]                    
                                         confirmation                                                                  
     --solo-chart-version                Solo testing chart version      [string] [default: "0.63.2"]                  
     --storage-bucket                    name of storage bucket for      [string]                                      
                                         mirror node importer                                                          
     --storage-bucket-prefix             path prefix of storage bucket   [string]                                      
                                         mirror node importer
```

#### mirror node destroy

```
mirror node destroy

Deletes the specified node from the deployment.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --chart-dir           Local chart directory path      [string]                  
                           (e.g. ~/solo-charts/charts)                               
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
     --dev                 Enable developer mode           [boolean] [default: false]
     --force               Force actions even if those     [boolean] [default: false]
                           can be skipped                                            
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --id                  The numeric identifier for the  [number]                  
                           component                                                 
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### mirror node upgrade

```
mirror node upgrade

Upgrades the specified node from the deployment.

Options:

-d,  --deployment                        The name the user will          [string] [required]                           
                                         reference locally to link to a                                                
                                         deployment                                                                    
                                                                                                                       
     --cache-dir                         Local cache directory           [string] [default: "~/.solo/cache"]
     --chart-dir                         Local chart directory path      [string]                                      
                                         (e.g. ~/solo-charts/charts)                                                   
-c,  --cluster-ref                       The cluster reference that      [string]                                      
                                         will be used for referencing                                                  
                                         the Kubernetes cluster and                                                    
                                         stored in the local and remote                                                
                                         configuration for the                                                         
                                         deployment.  For commands that                                                
                                         take multiple clusters they                                                   
                                         can be separated by commas.                                                   
     --dev                               Enable developer mode           [boolean] [default: false]                    
     --domain-name                       Custom domain name              [string]                                      
     --enable-ingress                    enable ingress on the           [boolean] [default: false]                    
                                         component/pod                                                                 
     --external-database-host            Use to provide the external     [string]                                      
                                         database host if the '                                                        
                                         --use-external-database ' is                                                  
                                         passed                                                                        
     --external-database-owner-password  Use to provide the external     [string]                                      
                                         database owner's password if                                                  
                                         the ' --use-external-database                                                 
                                         ' is passed                                                                   
     --external-database-owner-username  Use to provide the external     [string]                                      
                                         database owner's username if                                                  
                                         the ' --use-external-database                                                 
                                         ' is passed                                                                   
     --external-database-read-password   Use to provide the external     [string]                                      
                                         database readonly user's                                                      
                                         password if the '                                                             
                                         --use-external-database ' is                                                  
                                         passed                                                                        
     --external-database-read-username   Use to provide the external     [string]                                      
                                         database readonly user's                                                      
                                         username if the '                                                             
                                         --use-external-database ' is                                                  
                                         passed                                                                        
     --force                             Force enable block node         [boolean] [default: false]                    
                                         integration bypassing the                                                     
                                         version requirements CN >=                                                    
                                         v0.72.0, BN >= 0.29.0, CN >=                                                  
                                         0.150.0                                                                       
     --force-port-forward                Force port forward to access    [boolean] [default: true]                     
                                         the network services                                                          
     --id                                The numeric identifier for the  [number]                                      
                                         component                                                                     
     --ingress-controller-value-file     The value file to use for       [string]                                      
                                         ingress controller, defaults                                                  
                                         to ""                                                                         
     --mirror-node-chart-dir             Mirror node local chart         [string]                                      
                                         directory path (e.g.                                                          
                                         ~/hiero-mirror-node/charts)                                                   
     --mirror-node-version               Mirror node chart version       [string] [default: "v0.151.0"]                
     --mirror-static-ip                  static IP address for the       [string]                                      
                                         mirror node                                                                   
     --operator-id                       Operator ID                     [string]                                      
     --operator-key                      Operator Key                    [string]                                      
     --pinger                            Enable Pinger service in the    [boolean] [default: false]                    
                                         Mirror node monitor                                                           
-q,  --quiet-mode                        Quiet mode, do not prompt for   [boolean] [default: false]                    
                                         confirmation                                                                  
     --solo-chart-version                Solo testing chart version      [string] [default: "0.63.2"]                  
     --storage-bucket                    name of storage bucket for      [string]                                      
                                         mirror node importer
```

## relay

```
relay

RPC Relay Node operations for creating, modifying, and destroying resources. These commands require the presence of an existing deployment.

Commands:
  relay node   List, create, manage, or destroy relay node instances. Operates on a single relay node instance at a time.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### relay node

```
relay node

List, create, manage, or destroy relay node instances. Operates on a single relay node instance at a time.

Commands:
  relay node add       Adds and configures a new node instance.
  relay node destroy   Deletes the specified node from the deployment.
  relay node upgrade   Upgrades the specified node from the deployment.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### relay node add

```
relay node add

Adds and configures a new node instance.

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
                                                                                                         
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
-l,  --chain-id            Chain ID                        [string] [default: "298"]                     
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
-c,  --cluster-ref         The cluster reference that      [string]                                      
                           will be used for referencing                                                  
                           the Kubernetes cluster and                                                    
                           stored in the local and remote                                                
                           configuration for the                                                         
                           deployment.  For commands that                                                
                           take multiple clusters they                                                   
                           can be separated by commas.                                                   
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --domain-name         Custom domain name              [string]                                      
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --mirror-namespace    Namespace to use for the        [string]                                      
                           Mirror Node deployment, a new                                                 
                           one will be created if it does                                                
                           not exist                                                                     
     --mirror-node-id      The id of the mirror node       [number]                                      
                           which to connect                                                              
-i,  --node-aliases        Comma separated node aliases    [string]                                      
                           (empty means all nodes)                                                       
     --operator-id         Operator ID                     [string]                                      
     --operator-key        Operator Key                    [string]                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
     --relay-chart-dir     Relay local chart directory     [string]                                      
                           path (e.g.                                                                    
                           ~/hiero-json-rpc-relay/charts)                                                
     --relay-release       Relay release tag to be used    [string] [default: "0.75.0"]                  
                           (e.g. v0.48.0)                                                                
     --replica-count       Replica count                   [number] [default: 1]                         
-f,  --values-file         Comma separated chart values    [string]                                      
                           file                                                                          
-v,  --version             Show version number             [boolean]
```

#### relay node destroy

```
relay node destroy

Deletes the specified node from the deployment.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --chart-dir           Local chart directory path      [string]                  
                           (e.g. ~/solo-charts/charts)                               
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --id                  The numeric identifier for the  [number]                  
                           component                                                 
-i,  --node-aliases        Comma separated node aliases    [string]                  
                           (empty means all nodes)                                   
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

#### relay node upgrade

```
relay node upgrade

Upgrades the specified node from the deployment.

Options:

-d,  --deployment          The name the user will          [string] [required]                           
                           reference locally to link to a                                                
                           deployment                                                                    
                                                                                                         
     --cache-dir           Local cache directory           [string] [default: "~/.solo/cache"]
-l,  --chain-id            Chain ID                        [string] [default: "298"]                     
     --chart-dir           Local chart directory path      [string]                                      
                           (e.g. ~/solo-charts/charts)                                                   
-c,  --cluster-ref         The cluster reference that      [string]                                      
                           will be used for referencing                                                  
                           the Kubernetes cluster and                                                    
                           stored in the local and remote                                                
                           configuration for the                                                         
                           deployment.  For commands that                                                
                           take multiple clusters they                                                   
                           can be separated by commas.                                                   
     --dev                 Enable developer mode           [boolean] [default: false]                    
     --domain-name         Custom domain name              [string]                                      
     --force-port-forward  Force port forward to access    [boolean] [default: true]                     
                           the network services                                                          
     --id                  The numeric identifier for the  [number]                                      
                           component                                                                     
     --mirror-namespace    Namespace to use for the        [string]                                      
                           Mirror Node deployment, a new                                                 
                           one will be created if it does                                                
                           not exist                                                                     
     --mirror-node-id      The id of the mirror node       [number]                                      
                           which to connect                                                              
-i,  --node-aliases        Comma separated node aliases    [string]                                      
                           (empty means all nodes)                                                       
     --operator-id         Operator ID                     [string]                                      
     --operator-key        Operator Key                    [string]                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                    
                           confirmation                                                                  
     --relay-chart-dir     Relay local chart directory     [string]                                      
                           path (e.g.                                                                    
                           ~/hiero-json-rpc-relay/charts)                                                
     --relay-release       Relay release tag to be used    [string] [default: "0.75.0"]                  
                           (e.g. v0.48.0)                                                                
     --replica-count       Replica count                   [number] [default: 1]                         
-f,  --values-file         Comma separated chart values    [string]                                      
                           file                                                                          
-v,  --version             Show version number             [boolean]
```

## one-shot

```
one-shot

One Shot commands for new and returning users who need a preset environment type. These commands use reasonable defaults to provide a single command out of box experience.

Commands:
  one-shot single   Creates a uniquely named deployment with a single consensus node, mirror node, block node, relay node, and explorer node.
  one-shot multi    Creates a uniquely named deployment with multiple consensus nodes, mirror node, block node, relay node, and explorer node.
  one-shot falcon   Creates a uniquely named deployment with optional chart values override using --values-file.
  one-shot show     Display information about one-shot deployments.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### one-shot single

```
one-shot single

Creates a uniquely named deployment with a single consensus node, mirror node, block node, relay node, and explorer node.

Commands:
  one-shot single deploy    Deploys all required components for the selected one shot configuration.
  one-shot single destroy   Removes the deployed resources for the selected one shot configuration.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### one-shot single deploy

```
one-shot single deploy

Deploys all required components for the selected one shot configuration.

Options:

                                                                                     
-c,  --cluster-ref         The cluster reference that      [string]                  
                           will be used for referencing                              
                           the Kubernetes cluster and                                
                           stored in the local and remote                            
                           configuration for the                                     
                           deployment.  For commands that                            
                           take multiple clusters they                               
                           can be separated by commas.                               
-d,  --deployment          The name the user will          [string]                  
                           reference locally to link to a                            
                           deployment                                                
     --dev                 Enable developer mode           [boolean] [default: false]
     --force               Force actions even if those     [boolean] [default: false]
                           can be skipped                                            
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
     --minimal-setup       Create a deployment with        [boolean] [default: false]
                           minimal setup. Only includes a                            
                           single consensus node and                                 
                           mirror node                                               
-n,  --namespace           Namespace                       [string]                  
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
     --rollback            Automatically clean up          [boolean] [default: false]
                           resources when deploy fails.                              
                           Use  --no-rollback  to skip                               
                           cleanup and keep partial                                  
                           resources for inspection.                                 
-v,  --version             Show version number             [boolean]
```

#### one-shot single destroy

```
one-shot single destroy

Removes the deployed resources for the selected one shot configuration.

Options:

                                                                                     
-d,  --deployment          The name the user will          [string]                  
                           reference locally to link to a                            
                           deployment                                                
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

### one-shot multi

```
one-shot multi

Creates a uniquely named deployment with multiple consensus nodes, mirror node, block node, relay node, and explorer node.

Commands:
  one-shot multi deploy    Deploys all required components for the selected multiple node one shot configuration.
  one-shot multi destroy   Removes the deployed resources for the selected multiple node one shot configuration.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### one-shot multi deploy

```
one-shot multi deploy

Deploys all required components for the selected multiple node one shot configuration.

Options:

                                                                                      
-c,  --cluster-ref          The cluster reference that      [string]                  
                            will be used for referencing                              
                            the Kubernetes cluster and                                
                            stored in the local and remote                            
                            configuration for the                                     
                            deployment.  For commands that                            
                            take multiple clusters they                               
                            can be separated by commas.                               
-d,  --deployment           The name the user will          [string]                  
                            reference locally to link to a                            
                            deployment                                                
     --dev                  Enable developer mode           [boolean] [default: false]
     --force                Force actions even if those     [boolean] [default: false]
                            can be skipped                                            
     --force-port-forward   Force port forward to access    [boolean] [default: true] 
                            the network services                                      
     --minimal-setup        Create a deployment with        [boolean] [default: false]
                            minimal setup. Only includes a                            
                            single consensus node and                                 
                            mirror node                                               
-n,  --namespace            Namespace                       [string]                  
     --num-consensus-nodes  Used to specify desired number  [number]                  
                            of consensus nodes for                                    
                            pre-genesis deployments                                   
-q,  --quiet-mode           Quiet mode, do not prompt for   [boolean] [default: false]
                            confirmation                                              
     --rollback             Automatically clean up          [boolean] [default: false]
                            resources when deploy fails.                              
                            Use  --no-rollback  to skip                               
                            cleanup and keep partial                                  
                            resources for inspection.                                 
-v,  --version              Show version number             [boolean]
```

#### one-shot multi destroy

```
one-shot multi destroy

Removes the deployed resources for the selected multiple node one shot configuration.

Options:

                                                                                     
-d,  --deployment          The name the user will          [string]                  
                           reference locally to link to a                            
                           deployment                                                
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

### one-shot falcon

```
one-shot falcon

Creates a uniquely named deployment with optional chart values override using --values-file.

Commands:
  one-shot falcon deploy    Deploys all required components for the selected one shot configuration (with optional values file).
  one-shot falcon destroy   Removes the deployed resources for the selected one shot configuration (with optional values file).

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### one-shot falcon deploy

```
one-shot falcon deploy

Deploys all required components for the selected one shot configuration (with optional values file).

Options:

                                                                                      
-c,  --cluster-ref          The cluster reference that      [string]                  
                            will be used for referencing                              
                            the Kubernetes cluster and                                
                            stored in the local and remote                            
                            configuration for the                                     
                            deployment.  For commands that                            
                            take multiple clusters they                               
                            can be separated by commas.                               
     --deploy-explorer      Deploy explorer as part of      [boolean] [default: true] 
                            one-shot falcon deployment                                
     --deploy-mirror-node   Deploy mirror node as part of   [boolean] [default: true] 
                            one-shot falcon deployment                                
     --deploy-relay         Deploy relay as part of         [boolean] [default: true] 
                            one-shot falcon deployment                                
-d,  --deployment           The name the user will          [string]                  
                            reference locally to link to a                            
                            deployment                                                
     --dev                  Enable developer mode           [boolean] [default: false]
     --force                Force actions even if those     [boolean] [default: false]
                            can be skipped                                            
     --force-port-forward   Force port forward to access    [boolean] [default: true] 
                            the network services                                      
-n,  --namespace            Namespace                       [string]                  
     --num-consensus-nodes  Used to specify desired number  [number]                  
                            of consensus nodes for                                    
                            pre-genesis deployments                                   
-q,  --quiet-mode           Quiet mode, do not prompt for   [boolean] [default: false]
                            confirmation                                              
     --rollback             Automatically clean up          [boolean] [default: false]
                            resources when deploy fails.                              
                            Use  --no-rollback  to skip                               
                            cleanup and keep partial                                  
                            resources for inspection.                                 
-f,  --values-file          Comma separated chart values    [string]                  
                            file                                                      
-v,  --version              Show version number             [boolean]
```

#### one-shot falcon destroy

```
one-shot falcon destroy

Removes the deployed resources for the selected one shot configuration (with optional values file).

Options:

                                                                                     
-d,  --deployment          The name the user will          [string]                  
                           reference locally to link to a                            
                           deployment                                                
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

### one-shot show

```
one-shot show

Display information about one-shot deployments.

Commands:
  one-shot show deployment   Display information about the last one-shot deployment including name, versions, and deployed components.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### one-shot show deployment

```
one-shot show deployment

Display information about the last one-shot deployment including name, versions, and deployed components.

Options:

                                                                                     
-d,  --deployment          The name the user will          [string]                  
                           reference locally to link to a                            
                           deployment                                                
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```

## rapid-fire

```
rapid-fire

Commands for performing load tests a Solo deployment

Commands:
  rapid-fire load      Run load tests using the network load generator with the selected class.
  rapid-fire destroy   Uninstall the Network Load Generator Helm chart and clean up resources.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

### rapid-fire load

```
rapid-fire load

Run load tests using the network load generator with the selected class.

Commands:
  rapid-fire load start   Start a rapid-fire load test using the selected class.
  rapid-fire load stop    Stop any running processes using the selected class.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### rapid-fire load start

```
rapid-fire load start

Start a rapid-fire load test using the selected class.

Options:

     --args                All arguments to be passed to   [string] [required]                       
                           the NLG load test class. Value                                            
                           MUST be wrapped in 2 sets of                                              
                           different quotes. Example:                                                
                           '"-c 100 -a 40 -t 3600"'                                                  
-d,  --deployment          The name the user will          [string] [required]                       
                           reference locally to link to a                                            
                           deployment                                                                
     --test                The class name of the           [string] [required]                       
                           Performance Test to run                                                   
                                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]                
     --force               Force actions even if those     [boolean] [default: false]                
                           can be skipped                                                            
     --force-port-forward  Force port forward to access    [boolean] [default: true]                 
                           the network services                                                      
     --javaHeap            Max Java heap size in GB for    [number] [default: 8]                     
                           the NLG load test class,                                                  
                           defaults to 8                                                             
     --max-tps             The maximum transactions per    [number] [default: 0]                     
                           second to be generated by the                                             
                           NLG load test                                                             
     --package             The package name of the         [string] [default: "com.hedera.benchmark"]
                           Performance Test to run.                                                  
                           Defaults to                                                               
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                
                           confirmation                                                              
-f,  --values-file         Comma separated chart values    [string]                                  
                           file                                                                      
-v,  --version             Show version number             [boolean]
```

#### rapid-fire load stop

```
rapid-fire load stop

Stop any running processes using the selected class.

Options:

-d,  --deployment          The name the user will          [string] [required]                       
                           reference locally to link to a                                            
                           deployment                                                                
     --test                The class name of the           [string] [required]                       
                           Performance Test to run                                                   
                                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]                
     --force               Force actions even if those     [boolean] [default: false]                
                           can be skipped                                                            
     --force-port-forward  Force port forward to access    [boolean] [default: true]                 
                           the network services                                                      
     --package             The package name of the         [string] [default: "com.hedera.benchmark"]
                           Performance Test to run.                                                  
                           Defaults to                                                               
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]                
                           confirmation                                                              
-v,  --version             Show version number             [boolean]
```

### rapid-fire destroy

```
rapid-fire destroy

Uninstall the Network Load Generator Helm chart and clean up resources.

Commands:
  rapid-fire destroy all   Uninstall the Network Load Generator Helm chart and remove all related resources.

Options:

                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-v,  --version             Show version number             [boolean]
```

#### rapid-fire destroy all

```
rapid-fire destroy all

Uninstall the Network Load Generator Helm chart and remove all related resources.

Options:

-d,  --deployment          The name the user will          [string] [required]       
                           reference locally to link to a                            
                           deployment                                                
                                                                                     
     --dev                 Enable developer mode           [boolean] [default: false]
     --force               Force actions even if those     [boolean] [default: false]
                           can be skipped                                            
     --force-port-forward  Force port forward to access    [boolean] [default: true] 
                           the network services                                      
-q,  --quiet-mode          Quiet mode, do not prompt for   [boolean] [default: false]
                           confirmation                                              
-v,  --version             Show version number             [boolean]
```
