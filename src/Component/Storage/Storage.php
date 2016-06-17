<?php

namespace Creonit\AdminBundle\Component\Storage;

use Creonit\AdminBundle\Component\Field\Field;
use Symfony\Component\DependencyInjection\ContainerInterface;

abstract class Storage
{

    /** @var ContainerInterface */
    protected $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    /**
     * @param $query
     * @return mixed
     */
    abstract public function createEntity($query);

    /**
     * @param array $query
     * @return mixed
     */
    abstract public function getEntity($query);

    /**
     * @param array $query
     * @return mixed
     */
    abstract public function getEntities($query);


    /**
     * @param $entity
     * @param Field $field
     * @return mixed
     */
    abstract public function getData($entity, Field $field);

    /**
     * @param $entity
     * @param Field $field
     * @param $data
     * @return mixed
     */
    abstract public function setData($entity, Field $field);


    /**
     * @param $entity
     * @return mixed
     */
    abstract public function saveEntity($entity);

    abstract public function deleteEntity($entity);
    
    abstract public function getKey($entity);
}