<?php

namespace Creonit\AdminBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class ModulePass implements CompilerPassInterface {

    public function process(ContainerBuilder $container)
    {

        $modulesIds = $container->findTaggedServiceIds('creonit_admin.module');

        foreach ($modulesIds as $moduleId => $options) {
            $container->getDefinition('creonit_admin')->addMethodCall('addModule', [new Reference($moduleId), $options]);
        }
        
    }
} 