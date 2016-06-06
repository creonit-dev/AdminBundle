<?php

namespace Creonit\AdminBundle\Component\Field;

use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileField extends Field
{
    /**
     * @param UploadedFile $data
     * @return string
     */
    public function processData($data)
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


}
