<?php

namespace Creonit\AdminBundle\Component\Field;


class DateField extends Field
{
    protected $type = 'date';

    /**
     * @param \DateTime $data
     * @return mixed
     */
    public function decorate($data)
    {
        return $data ? $data->format('d.m.Y H:i:s') : '';
    }


}
