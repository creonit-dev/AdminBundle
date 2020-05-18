<?php

namespace Creonit\AdminBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

class Configuration implements ConfigurationInterface
{
    /**
     * {@inheritdoc}
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder('creonit_admin');
        $rootNode = $treeBuilder->getRootNode();
        $rootNode
            ->children()
                ->scalarNode('title')->isRequired()->end()
                ->scalarNode('icon')->end()
                ->variableNode('modules')->end()
            ->end()
        ;

        return $treeBuilder;
    }
}
