<?php

namespace Creonit\AdminBundle\Component\Scope;

use Creonit\AdminBundle\Component\Field\CheckboxField;
use Creonit\AdminBundle\Component\Field\DateField;
use Creonit\AdminBundle\Component\Field\ExternalField;
use Creonit\AdminBundle\Component\Field\Field;
use Creonit\AdminBundle\Component\Field\FileField;
use Creonit\AdminBundle\Component\Field\GalleryField;
use Creonit\AdminBundle\Component\Field\ImageField;
use Creonit\AdminBundle\Component\Field\SelectField;
use Creonit\AdminBundle\Component\Field\VideoField;
use Propel\Runtime\ActiveQuery\ModelCriteria;
use Propel\Runtime\Map\TableMap;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;

class Scope
{

    protected $name;
    protected $entity;
    protected $tableMap;

    protected $template = '';

    /** @var Scope */
    protected $parentScope;

    /** @var Scope[] */
    protected $scopes = [];
    protected $scopesType = Scope::class;


    /** @var ContainerInterface */
    protected $container;


    /** @var Field[] */
    protected $fields = [];

    /**
     * @param ContainerInterface $container
     * @return $this
     */
    public function setContainer(ContainerInterface $container)
    {
        $this->container = $container;
        return $this;
    }

    public function addField(Field $field){
        $this->fields[$field->getName()] = $field;
        return $this;
    }

    public function hasField($fieldName)
    {
        return array_key_exists($fieldName, $this->fields);
    }


    public function setName($name)
    {
        $this->name = $name;
        $this->setEntity($this->name);
        return $this;
    }

    protected function setEntity($entity)
    {
        if(strpos($entity, '\\') === false){
            $entity = 'App\\Model\\' . $entity;
        }
        if(class_exists($entity)){
            $this->entity = $entity;
            $tableMap = $entity::TABLE_MAP;
            $this->tableMap = $tableMap::getTableMap();
        }
        return $this;
    }

    public function getEntity()
    {
        return $this->entity;
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return ModelCriteria
     */
    public function createQuery(){
        $queryClass = $this->entity . 'Query';
        return new $queryClass;
    }

    public function createEntity(){
        $entityClass = $this->entity;
        return new $entityClass;
    }

    /**
     * @return TableMap
     */
    public function getTableMap()
    {
        return $this->tableMap;
    }

    public function applySchemaAnnotations($annotations){

        if(array_key_exists('parameters', $annotations)){
            foreach ($annotations['parameters'] as $annotation){
                $this->applySchemaAnnotation($annotation);
            }
        }

        if(array_key_exists('scopes', $annotations)) {
            foreach ($annotations['scopes'] as $scopeName => $scopeAnnotations){
                /** @var Scope $scope */
                $scope = new $this->scopesType;
                $scope->setContainer($this->container);
                $scope->setName($scopeName);
                $scope->applySchemaAnnotations($scopeAnnotations);
                $this->addScope($scope);
            }
        }

        return $this;
    }

    public function setTemplate($template)
    {
        $this->template = $template;
        return $this;
    }



    public function getTemplate()
    {
        return $this->template;
    }


    public function applySchemaAnnotation($annotation){
        switch($annotation['key']){
            case 'field':
                if(preg_match('/^([\w_]+)(?:\:([\w_]+))?(?: *(\{.*\}))?$/usi', $annotation['value'], $match)){
                    $type = isset($match[2]) ? $match[2] : 'default';
                    $name = $match[1];
                    if(isset($match[3])){
                        $language = new ExpressionLanguage();
                        $constraints = ['NotBlank', 'Blank', 'NotNull', 'IsNull', 'IsTrue', 'IsFalse', 'Type', 'Email', 'Length', 'Url', 'Regex', 'Ip', 'Uuid', 'Range', 'EqualTo', 'NotEqualTo', 'IdenticalTo', 'NotIdenticalTo', 'LessThan', 'LessThanOrEqual', 'GreaterThan', 'GreaterThanOrEqual', 'Date', 'DateTime', 'Time', 'Choice', 'Collection', 'Count', 'UniqueEntity', 'Language', 'Locale', 'Country', 'File', 'Image', 'Bic', 'CardScheme', 'Currency', 'Luhn', 'Iban', 'Isbn', 'Issn', 'Callback', 'Expression', 'All', 'UserPassword', 'Valid'];
                        foreach($constraints as $constraint){
                            $language->register($constraint, function(){}, function ($arguments, $options = []) use ($constraint) {
                                $constraint = 'Symfony\\Component\\Validator\\Constraints\\' . $constraint; return new $constraint($options);
                            });
                        }

                        $options = $language->evaluate($match[3]);
                    }else{
                        $options = [];
                    }
                    $this->addField($this->createField($name, $options, $type));
                }
                break;
            case 'entity':
                $this->setEntity($annotation['value']);
                break;
            case 'template':
                $this->setTemplate($annotation['value']);
                break;
        }
        return $this;
    }

    public function createField($name, $parameters = [], $type = null){
        return $this->container->get('creonit_admin')->createField($name, $parameters, $type);
    }

    public function getFields(){
        return $this->fields;
    }


    /**
     * @param $name
     * @return Field|CheckboxField|DateField|ExternalField|SelectField
     */
    public function getField($name){
        return $this->fields[$name];
    }

    public function addScope(Scope $scope)
    {
        $scope->setParentScope($this);
        $this->scopes[$scope->getName()] = $scope;
        return $this;
    }

    public function hasScope($scopeName){
        return array_key_exists($scopeName, $this->scopes);
    }


    /**
     * @param $scopeName
     * @return Scope|ListRowScope|TableRowScope
     */
    public function getScope($scopeName){
        return $this->scopes[$scopeName];
    }


    public function setParentScope(Scope $scope){
        $this->parentScope = $scope;
    }

    public function dump(){
        $schema = [
            'name' => $this->name,
            'template' => $this->template,
        ];

        foreach ($this->scopes as $scope){
            $schema['scopes'][] = $scope->dump();
        }


        return $schema;
    }

    public function prepareTemplate()
    {
        $createField = function ($match){
            if(!$this->hasField($match[1])){
                $type = 'default';

                switch($match[2]){
                    case 'input':
                        if(preg_match('/^\s*["\'](\w+)["\']/', $match[4], $inputMatch)){
                            switch ($inputMatch[1]){
                                case 'date':
                                case 'datetime':
                                    $type = 'date';
                                    break;
                            }
                        }

                        break;

                    case 'file':
                        $type = 'file';
                        break;
                    case 'video':
                        $type = 'video';
                        break;
                    case 'image':
                        $type = 'image';
                        break;
                    case 'gallery':
                        $type = 'gallery';
                        break;
                    case 'content':
                        $type = 'content';
                        break;
                    case 'external':
                        $type = 'external';
                        break;
                    case 'select':
                    case 'radio':
                        $type = 'select';
                        break;
                    case 'checkbox':
                        $type = 'checkbox';
                        break;
                }
                $this->addField($this->createField($match[1], [], $type));
            }
        };

        $this->template = preg_replace_callback(
            '/\{\{\s*([\w_]+)\s*\|\s*(textarea|textedit|content|text|input|gallery|file|image|video|external|select|checkbox|radio)(?!_)(\(?\)?)(.*?\}\})/usi',
            function($match) use ($createField){
                $createField($match);
                return "{{ {$match[1]} | {$match[2]}" . (($match[3] && $match[3] != '()') ? "('{$match[1]}', " : "('{$match[1]}')") . $match[4];
            },
            $this->template
        );

        $this->template = preg_replace_callback(
            '/\(\s*([\w_]+)\s*\|\s*(textarea|textedit|content|text|input|gallery|file|image|video|external|select|checkbox|radio)(?!_)(\(?\)??)(.*?\))/usi',
            function($match) use ($createField){
                $createField($match);
                return "( {$match[1]} | {$match[2]}" . (($match[3] && $match[3] != '()') ? "('{$match[1]}', " : "('{$match[1]}')") . $match[4];
            },
            $this->template
        );

        if(preg_match_all('/\{\{\s*([\w_]+)\s*\|\s*date(?:\(|\s|\}|\))/usi', $this->template, $matches, PREG_SET_ORDER)){
            foreach($matches as $match){
                if(!$this->hasField($match[1])){
                    $this->addField($this->createField($match[1], [], 'date'));
                }
            }
        }

        if(preg_match_all('/\{\{\s*([\w_]+)\s*(?:\||\}\})/usi', $this->template, $matches, PREG_SET_ORDER)){
            foreach($matches as $match){
                if(!$this->hasField($match[1])){
                    $this->addField($this->createField($match[1]));
                }
            }
        }

        foreach ($this->scopes as $scope) {
            $scope->prepareTemplate();
        }

        return $this;
    }


}