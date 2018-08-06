<?php

namespace Creonit\AdminBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\PriorityTaggedServiceTrait;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class PluginPass implements CompilerPassInterface {

    use PriorityTaggedServiceTrait;

    public function process(ContainerBuilder $container)
    {
        $pluginsIds = $this->findAndSortTaggedServices('creonit_admin.plugin', $container);

        foreach ($pluginsIds as $pluginId) {
            $container->getDefinition('creonit_admin')->addMethodCall('addPlugin', [new Reference((string) $pluginId)]);
        }

        $container->getDefinition('creonit_admin')->addMethodCall('initialize');
    }
} 