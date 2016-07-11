<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\MediaBundle\Model\File;
use Creonit\MediaBundle\Model\Image;
use Creonit\MediaBundle\Model\ImageQuery;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Propel\Runtime\Map\TableMap;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ImageField extends Field
{
    protected $type = 'image';


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

            if($image = ImageQuery::create()->findPk($fileId)){
                $image->delete();
            }

        }else if($data['file'] and !$data['file'] instanceof NoData){

            /** @var File $file */
            $file = new File();
            $file->setPath($data['file']['path']);
            $file->setName($data['file']['name']);
            $file->setOriginalName($data['file']['original_name']);
            $file->setExtension($data['file']['extension']);
            $file->setMime($data['file']['mime']);
            $file->setSize($data['file']['size']);

            $image = new Image();
            $image->setFile($file);
            $image->save();

            parent::save($entity, $image->getId(), true);
        }

    }

    public function decorate($data)
    {
        if(is_array($data)){
            $data['size'] = $this->formatSize($data['size']);
            $data['preview'] = $this->container->get('image.handling')->open("{$this->getWebDir()}/{$data['path']}/{$data['name']}")->cropResize(100, 100)->html('', 'png');
        }
        return $data;
    }


    public function load($entity)
    {
        if($value = parent::load($entity)){
            $image = ImageQuery::create()->findPk($value);
            $file = $image->getFile();

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
