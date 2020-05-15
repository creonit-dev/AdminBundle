<?php

namespace Creonit\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;

class LayoutController extends Controller
{
    public function sidebarAction(){
        return $this->render('@CreonitAdmin/Layout/sidebar.html.twig', ['admin' => $this->get('creonit_admin')]);
    }

    public function headerAction(){
        $admin = $this->get('creonit_admin');
        $module = $admin->getActiveModule();
        return $this->render('@CreonitAdmin/Layout/header.html.twig', ['module' => $module, 'admin' => $admin]);
    }
}
