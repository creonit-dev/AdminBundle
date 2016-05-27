<?php

namespace Creonit\AdminBundle\Component\Storage;

use Creonit\AdminBundle\Component\Field\Field;

class DoctrineStorage extends Storage
{

    /**
     * @param array $query
     * @return mixed
     */
    public function getEntity($query)
    {
    }

    /**
     * @param array $query
     * @return mixed
     */
    public function getEntities($query)
    {
    }

    /**
     * @param $entity
     * @param Field $field
     * @return mixed
     */
    public function getData($entity, Field $field)
    {
    }

    /**
     * @param $entity
     * @param Field $field
     * @param $data
     * @return mixed
     */
    public function setData($entity, Field $field, $data)
    {
    }

    /**
     * @param $entity
     * @return mixed
     */
    public function saveEntity($entity)
    {
    }

}