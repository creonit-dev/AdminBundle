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
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('creonit_admin');
        $rootNode
            ->children()
                ->scalarNode('title')->isRequired()->end()
                ->scalarNode('icon')->end()
            ->end()
        ;

        return $treeBuilder;
    }
}
