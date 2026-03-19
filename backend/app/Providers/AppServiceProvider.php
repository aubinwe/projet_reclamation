<?php

namespace App\Providers;

use App\Repositories\DemandeRepository;
use App\Repositories\Interfaces\DemandeRepositoryInterface;
use App\Repositories\Interfaces\MatiereRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\MatiereRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(DemandeRepositoryInterface::class, DemandeRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(MatiereRepositoryInterface::class, MatiereRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(function ($user, string $token) {
            return env('FRONTEND_URL', 'http://localhost:5173') . '/reset-password?token=' . $token . '&email=' . $user->email;
        });
    }
}
