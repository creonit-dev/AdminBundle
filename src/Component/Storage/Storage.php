<?php

namespace Creonit\AdminBundle\Component\Storage;

use Creonit\AdminBundle\Component\Field\Field;

abstract class Storage
{

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
    abstract public function setData($entity, Field $field, $data);


    /**
     * @param $entity
     * @return mixed
     */
    abstract public function saveEntity($entity);

    abstract public function getKey($entity);
}