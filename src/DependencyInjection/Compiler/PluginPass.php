<?php

namespace Creonit\AdminBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class PluginPass implements CompilerPassInterface {

    public function process(ContainerBuilder $container)
    {

        $pluginsIds = $container->findTaggedServiceIds('creonit_admin.plugin');

        foreach ($pluginsIds as $pluginId => $options) {
            $container->getDefinition('creonit_admin')->addMethodCall('addPlugin', [new Reference($pluginId), $options]);
        }
        
    }
} 