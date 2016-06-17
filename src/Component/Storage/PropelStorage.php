<?php

namespace Creonit\AdminBundle\Component\Storage;

use AppBundle\Model\FileQuery;
use AppBundle\Model\File;
use AppBundle\Model\Image;
use AppBundle\Model\ImageQuery;
use Creonit\AdminBundle\Component\Field\Field;
use Creonit\AdminBundle\Component\Field\FileField;
use Creonit\AdminBundle\Component\Field\ImageField;
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
     * @param $data
     * @return mixed
     */
    public function setData($entity, Field $field)
    {
        $data = $field->getData();

        if($this->getTableMap($entity)->hasColumn($field->getName())){

            switch(true){
                case ($field instanceof FileField):

                    if($field->attributes->has('delete')){
                        $fileId = $entity->getByName($field->getName(), TableMap::TYPE_FIELDNAME);

                        $entity->setByName($field->getName(), null, TableMap::TYPE_FIELDNAME);

                        if($file = FileQuery::create()->findPk($fileId)){
                            $file->delete();
                        }


                    }else if(is_array($data)){

                        $file = new File();
                        $file->setPath($data['path']);
                        $file->setName($data['name']);
                        $file->setOriginalName($data['original_name']);
                        $file->setExtension($data['extension']);
                        $file->setMime($data['mime']);
                        $file->setSize($data['size']);
                        $file->save();

                        $entity->setByName($field->getName(), $file->getId(), TableMap::TYPE_FIELDNAME);
                    }

                    break;

                case ($field instanceof ImageField):

                    if($field->attributes->has('delete')){
                        $fileId = $entity->getByName($field->getName(), TableMap::TYPE_FIELDNAME);

                        $entity->setByName($field->getName(), null, TableMap::TYPE_FIELDNAME);

                        if($image = ImageQuery::create()->findPk($fileId)){
                            $image->delete();
                        }

                    }else if(is_array($data)){

                        $file = new File();
                        $file->setPath($data['path']);
                        $file->setName($data['name']);
                        $file->setOriginalName($data['original_name']);
                        $file->setExtension($data['extension']);
                        $file->setMime($data['mime']);
                        $file->setSize($data['size']);

                        $image = new Image();
                        $image->setFile($file);
                        $image->save();

                        $entity->setByName($field->getName(), $image->getId(), TableMap::TYPE_FIELDNAME);
                    }

                    break;

                default:
                    $entity->setByName($field->getName(), $data, TableMap::TYPE_FIELDNAME);
            }

        }
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

                    if($value){

                        $file = FileQuery::create()->findPk($value);
                        return [
                            'mime' => $file->getMime(),
                            'size' => $file->getSize(),
                            'extension' => $file->getExtension(),
                            'path' => $file->getPath(),
                            'name' => $file->getName(),
                            'original_name' => $file->getOriginalName(),
                        ];

                    }

                    break;

               case ($field instanceof ImageField):

                    if($value){

                        $image = ImageQuery::create()->findPk($value);
                        $file = $image->getFile();
                        
                        return [
                            'mime' => $file->getMime(),
                            'size' => $file->getSize(),
                            'extension' => $file->getExtension(),
                            'path' => $file->getPath(),
                            'name' => $file->getName(),
                            'original_name' => $file->getOriginalName(),
                        ];

                    }

                    break;

                default:
                    return $value;
            }



        }

        return null;
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

    public function deleteEntity($entity)
    {
        return $entity->delete();
    }
}