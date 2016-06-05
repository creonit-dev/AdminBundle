<?php

namespace Creonit\AdminBundle\Component\Storage;

use Creonit\AdminBundle\Component\Field\Field;
use Creonit\AdminBundle\Component\Field\FileField;
use Propel\Runtime\ActiveQuery\ModelCriteria;
use Propel\Runtime\Map\TableMap;

class PropelStorage extends Storage
{

    private function getObjectClass($entityName){
        if(strpos($entityName, '\\') === false){
            return 'AppBundle\\Model\\' . $entityName;
        }else{
            return $entityName;
        }
    }

    private function getQueryClass($entityName){
        return $this->getObjectClass($entityName) . 'Query';
    }

    /**
     * @param $entity
     * @return TableMap
     */
    private function getTableMap($entity){
        $tableMap = $entity::TABLE_MAP;
        return $tableMap::getTableMap();
    }

    /**
     * @param $entity
     * @return ModelCriteria
     */
    private function getQuery($entity){
        $queryClass = $this->getQueryClass($entity);
        return new $queryClass;
    }


    /**
     * @param $query
     * @return mixed
     */
    public function createEntity($query)
    {
        $objectClass = $this->getObjectClass($query['entity']);
        return new $objectClass;
    }

    /**
     * @param array $settings
     * @return mixed
     * @internal param array $query
     */
    public function getEntity($settings)
    {
        $query = $this->getQuery($settings['entity']);
        return $query->findPk($settings['key']);
    }

    /**
     * @param array $query
     * @return mixed
     */
    public function getEntities($query)
    {
        $query = $this->getQuery($query['entity']);
        return $query->find();
    }

    /**
     * @param $entity
     * @param Field $field
     * @return mixed
     */
    public function getData($entity, Field $field)
    {

        if($this->getTableMap($entity)->hasColumn($field->getName())){
            $value = $entity->getByName($field->getName(), TableMap::TYPE_FIELDNAME);


            switch(true){
                case ($field instanceof FileField):

                    $data = [
                        'file' => 'hello',
                        'asd' => 444
                    ];


                    break;

                default:
                    $data = $value;
            }

            return $data;

        }else{
            return null;
        }
    }

    /**
     * @param $entity
     * @param Field $field
     * @param $data
     * @return mixed
     */
    public function setData($entity, Field $field, $data)
    {
        if($this->getTableMap($entity)->hasColumn($field->getName())){

            switch(true){
                case ($field instanceof FileField):

                    dump($data);


                    break;

                default:
                    $entity->setByName($field->getName(), $data, TableMap::TYPE_FIELDNAME);
            }

        }
    }

    /**
     * @param $entity
     * @return mixed
     */
    public function saveEntity($entity)
    {
        $entity->save();
        $tableMap = $entity::TABLE_MAP;
        $tableMap::removeInstanceFromPool($entity);
        return $entity;
    }

    /**
     * @param $entity
     * @return mixed
     */
    public function getKey($entity)
    {
        return $entity->getPrimaryKey();
    }
}