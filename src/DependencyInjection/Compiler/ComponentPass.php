<?php

namespace Creonit\AdminBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class ComponentPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        $componentsId = $container->findTaggedServiceIds('creonit_admin.component');

        foreach ($componentsId as $id => $tags) {
            $container->getDefinition($id)->setShared(false)->setPublic(true);
        }
    }
}
