<?php

namespace Creonit\AdminBundle\UtilsModule;

use Creonit\AdminBundle\Component\EditorComponent;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Propel\Runtime\Map\TableMap;

class GalleryVideoEditor extends EditorComponent
{


    /**
     *
     * @title Видео
     *
     * \GalleryItem
     *
     * @field url {constraints: [NotBlank()]}
     *
     * @template
     *
     * {{ url | text | group('Ссылка', {notice: 'видео на YouTube'}) }}
     * {{ sortable_rank | text | group('Сортировка') }}
     *
     */
    public function schema()
    {
    }

    public function validate(ComponentRequest $request, ComponentResponse $response, $entity)
    {
        if(!preg_match('#^(https?://)?(www\.)?(youtu\.be|youtube\.com)/(watch\?v=[\w\d_-]+|[\w\d_-]+)$#i', $request->data->get('url'))){
            $response->error('Неверный формат ссылки. Разрешены ссылки только на YouTube.', 'url');

        }
    }

    public function preSave(ComponentRequest $request, ComponentResponse $response, $entity)
    {
        if($entity->isNew()){
            $entity->setGalleryId($request->query->get('gallery_id'));
        }
    }


}
