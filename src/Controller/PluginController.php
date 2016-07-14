<?php

namespace Creonit\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class PluginController extends Controller
{

    public function javascriptsAction(){
        $admin = $this->get('creonit_admin');

        $javascripts = [];

        foreach ($admin->getPlugins() as $plugin){
            $javascripts = array_merge($javascripts, $plugin->getJavascripts());
        }

        return new Response(
            implode("\n",
                array_map(
                    function ($javascript) {
                        return "<script src=\"{$javascript}\"></script>";
                    },
                    $javascripts
                )
            )
        );
    }

    public function stylesheetsAction(){
        $admin = $this->get('creonit_admin');

        $stylesheets = [];

        foreach ($admin->getPlugins() as $plugin){
            $stylesheets = array_merge($stylesheets, $plugin->getStylesheets());
        }

        return new Response(
            implode("\n",
                array_map(
                    function ($stylesheet) {
                        return "<link rel=\"stylesheet\" href=\"{$stylesheet}\">";
                    },
                    $stylesheets
                )
            )
        );
    }

}
