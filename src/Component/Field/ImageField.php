<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ImageField extends Field
{
    public function extract(ComponentRequest $request)
    {
        parent::extract($request);
        if(null === $this->data){
            if($request->data->has($this->name . '__delete')){
                $this->attributes->set('delete', true);
            }
        }
    }


    /**
     * @param UploadedFile $data
     * @return string
     */
    public function process($data)
    {
        $extension = $data->guessExtension();
        $size = $data->getSize();
        $mime = $data->getMimeType();
        $path = '/uploads';
        $name = md5(uniqid()) . '.' . $extension;
        $originalName = $data->getClientOriginalName();

        $data->move($this->container->getParameter('kernel.root_dir') . '/../web' . $path, $name);

        return [
            'extension' => $extension,
            'size' => $size,
            'mime' => $mime,
            'path' => $path,
            'name' => $name,
            'original_name' => $originalName,
        ];
    }

    public function decorate($data)
    {
        if(is_array($data)){
            $data['size'] = $this->container->get('creonit_utils.file_manager')->formatSize($data['size']);
            $data['preview'] = $this->container->get('image.handling')->open("{$data['path']}/{$data['name']}")->cropResize(300, 300)->html();
        }
        return $data;
    }


}
