<?php

namespace Creonit\AdminBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\PriorityTaggedServiceTrait;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class ModulePass implements CompilerPassInterface
{
    use PriorityTaggedServiceTrait;

    public function process(ContainerBuilder $container)
    {
        $modulesIds = $this->findAndSortTaggedServices('creonit_admin.module', $container);

        foreach ($modulesIds as $moduleId) {
            $container->getDefinition('creonit_admin')->addMethodCall('addModule', [new Reference((string) $moduleId)]);
        }
    }
}
