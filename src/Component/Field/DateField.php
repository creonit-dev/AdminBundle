<?php

namespace Creonit\AdminBundle\Component\Field;


class DateField extends Field
{
    const TYPE = 'date';

    /**
     * @param \DateTime $data
     * @return mixed
     */
    public function decorate($data)
    {
        if ($data instanceof \DateTime) {
            return $data->format('d.m.Y H:i:s');
        }
        return $data ? date('d.m.Y H:i:s', is_int($data) ? $data : strtotime($data)) : '';
    }


}
