<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\MediaBundle\Model\File;
use Creonit\MediaBundle\Model\FileQuery;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Propel\Runtime\Map\TableMap;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileField extends Field
{
    protected $type = 'file';

    public function extract(ComponentRequest $request)
    {
        return [
            'file' => parent::extract($request),
            'delete' => $request->data->has($this->name . '__delete')
        ];
    }


    public function process($data)
    {
        /** @var UploadedFile $file */
        if($file = $data['file'] and !$file instanceof NoData){

            $extension = $file->guessExtension();
            $size = $file->getSize();
            $mime = $file->getMimeType();
            $path = '/uploads';
            $name = md5(uniqid()) . '.' . $extension;
            $originalName = $file->getClientOriginalName();

            $file->move($this->getWebDir() . $path, $name);

            $data['file'] = [
                'extension' => $extension,
                'size' => $size,
                'mime' => $mime,
                'path' => $path,
                'name' => $name,
                'original_name' => $originalName,
            ];

        }

        return $data;
    }

    public function save($entity, $data, $processed = false)
    {
        if($processed === false){
            $data = $this->process($data);
        }

        if($data['delete']){
            $fileId = $entity->getByName($this->name, TableMap::TYPE_FIELDNAME);
            parent::save($entity, null, true);

            if($file = FileQuery::create()->findPk($fileId)){
                $file->delete();
            }

        }else if($data['file'] and !$data['file'] instanceof NoData){

            /** @var File $file */
            $file = new File();
            $file->setPath($data['path']);
            $file->setName($data['name']);
            $file->setOriginalName($data['original_name']);
            $file->setExtension($data['extension']);
            $file->setMime($data['mime']);
            $file->setSize($data['size']);

            parent::save($entity, $file->getId(), true);
        }

    }

    public function decorate($data)
    {
        if(is_array($data)){
            $data['size'] = $this->formatSize($data['size']);
        }
        return $data;
    }

    public function load($entity)
    {
        if($value = parent::load($entity)){
            $file = FileQuery::create()->findPk($value);
            return $this->decorate([
                'mime' => $file->getMime(),
                'size' => $file->getSize(),
                'extension' => $file->getExtension(),
                'path' => $file->getPath(),
                'name' => $file->getName(),
                'original_name' => $file->getOriginalName(),
            ]);
        }else{
            return $value;
        }
    }

    protected function getWebDir(){
        return $this->container->getParameter('kernel.root_dir') . '/../web';
    }


    protected function formatSize($size){
        if($size > 1048576){
            return round($size / 1048576, 1) . ' Мб';
        }else if($size > 1024){
            return round($size / 1024, 1) . ' Кб';
        }else{
            return $size . ' б';
        }
    }

}
