<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\AdminBundle\Component\Request\ComponentRequest;

class DateField extends Field
{
    /**
     * @param \DateTime $data
     * @return mixed
     */
    public function decorate($data)
    {
        return $data ? $data->format('d.m.Y H:i:s') : '';
    }


}
