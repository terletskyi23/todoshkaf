Rails.application.routes.draw do
  root 'tasks#index'
  resources :tasks
  get 'tasks/change_status/:id', to: 'tasks#change_status'
end
