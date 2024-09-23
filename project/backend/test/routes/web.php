<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Models\User;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/
// use Illuminate\Support\Facades\Route;

// Route::get('/users', function () {
//     return response()->json(['users' => User::all()]);
// });
Route::get('/users/create', function () {
    return response()->json(['users' => User::all()]);
});

