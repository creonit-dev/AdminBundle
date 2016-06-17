<?php

namespace Creonit\AdminBundle\UtilsModule;

use Creonit\AdminBundle\Component\Pattern\ListPattern;
use Creonit\AdminBundle\Component\Pattern\TablePattern;
use Creonit\AdminBundle\Component\TableComponent;

class GalleryTable extends TableComponent
{


    /**
     *
     * @header
     * {{ button('Добавить изображение', {icon: 'image'}) | open('CreonitUtils.GalleryImageEditor', _query) }}
     * {{ button('Добавить видео', {icon: 'youtube-play'}) | open('CreonitUtils.GalleryVideoEditor', _query) }}
     *
     * @cols 'Изображение / Видео', 'Сортировка', .
     *
     * \GalleryItem
     *
     * @field image_id:image
     * @field url:image
     *
     * @col
     * {{ image_id.preview | raw | open('CreonitUtils.GalleryImageEditor', {key: _key}) }}
     * @col {{ sortable_rank }}
     * @col {{ _delete() }}
     *
     */
    public function schema()
    {


    }


}