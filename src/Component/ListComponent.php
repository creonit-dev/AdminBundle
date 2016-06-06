<?php

namespace Creonit\AdminBundle\Component;

use Creonit\AdminBundle\Component\Pattern\ListPattern;

abstract class ListComponent extends Component
{

    protected $header = '';

    /**
     * @param string $header
     */
    public function setHeader($header)
    {
        $this->header = $header;
    }

    /**
     * @return string
     */
    public function getHeader()
    {
        return $this->header;
    }

    protected function prepareSchema()
    {

        $this->setTemplate(
<<<EOD
            <div class="component-list-filter"></div>
            <div class="component-list-body"></div>
            <div class="component-list-total">Итого: 1000 записей</div>
EOD
        );
        
        /*
        foreach ($schema as $annotation){
            $pattern = new ComponentPattern('');
            $pattern->parseAnnotations($annotation);
            $this->addPattern($pattern);
        }
        
        */
        

    }


    public function createPattern($name){
        $pattern = $this->container->get('creonit_admin.component.pattern.list');
        $pattern->setName($name);
        return $pattern;
    }


    /**
     * @param $name
     * @return ListPattern
     */
    public function getPattern($name){
        return parent::getPattern($name);
    }


    /**
     * @param ListPattern $pattern
     * @param array $data
     * @param mixed $entity
     * @return array
     */
    public function decorate(ListPattern $pattern, $data, $entity){
        return $data;
    }


    public function applySchemaAnnotation($annotation)
    {
        switch($annotation['key']){
            case 'header':
                $this->setHeader($annotation['value']);
                break;
            default:
                parent::applySchemaAnnotation($annotation);
        }
    }


}