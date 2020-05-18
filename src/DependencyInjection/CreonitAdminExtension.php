<?php

namespace Creonit\AdminBundle\DependencyInjection;

use Creonit\AdminBundle\Component\Component;
use Creonit\AdminBundle\Module;
use Creonit\AdminBundle\Plugin;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;

class CreonitAdminExtension extends Extension
{
    /**
     * {@inheritdoc}
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        $loader = new Loader\YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));
        $loader->load('services.yml');

        $manager = $container->getDefinition('creonit_admin');
        $manager->addMethodCall('setTitle', [$config['title']]);
        if (isset($config['icon'])) {
            $manager->addMethodCall('setIcon', [$config['icon']]);
        }
        if (isset($config['modules']) and is_array($config['modules'])) {
            $manager->addMethodCall('setModulesConfig', [$config['modules']]);
        }

        $container->registerForAutoconfiguration(Module::class)->addTag('creonit_admin.module');
        $container->registerForAutoconfiguration(Component::class)->addTag('creonit_admin.component');
        $container->registerForAutoconfiguration(Plugin::class)->addTag('creonit_admin.plugin');
    }
}
