<?php

namespace Creonit\AdminBundle\UtilsModule;

use AppBundle\Model\Base\GalleryQuery;
use AppBundle\Model\GalleryItem;
use Creonit\AdminBundle\Component\EditorComponent;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;

class GalleryImageEditor extends EditorComponent
{


    /**
     * @title Изображение
     * @entity GalleryItem
     * @template
     * {{ image_id | image({deletable:false}) | group }}
     *
     */
    public function schema()
    {
    }

    /**
     * @param ComponentRequest $request
     * @param ComponentResponse $response
     * @param GalleryItem $entity
     */
    public function validate(ComponentRequest $request, ComponentResponse $response, $entity)
    {
        if ($entity->isNew() and !GalleryQuery::create()->findPk($request->query->get('gallery_id'))) {
            $response->error('Галерея не найдена');
        }

        if ($entity->isNew() and !$request->data->has('image_id')) {
            $response->error('Загрузите изображение', 'image_id');
        }
    }

    /**
     * @param ComponentRequest $request
     * @param ComponentResponse $response
     * @param GalleryItem $entity
     */
    public function preSave(ComponentRequest $request, ComponentResponse $response, $entity)
    {
        if ($entity->isNew()) {
            $entity->setGalleryId($request->query->get('gallery_id'));
        }
    }

}