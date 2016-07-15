<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\AdminBundle\Component\Request\ComponentRequest;

class CheckboxField extends Field
{
    const TYPE = 'checkbox';
    const HELPERS = 'checkbox';

    public function extract(ComponentRequest $request)
    {
        return $request->data->has($this->name);
    }

}
