class TasksController < ApplicationController
  before_action :_set_task, only: [:update, :destroy, :change_status]

  def index
    @tasks = Task.all
  end

  def create
    @task = Task.new(_task_params)
    status = @task.save ? 200 : 422
    render template: 'tasks/show.json', status: status
  end

  def update
    status = @task.update_attribute(:description, params[:description]) ? 200 : 422
    render template: 'tasks/show.json', status: status
  end

  def destroy
    @task.destroy
    render template: 'tasks/show.json'
  end

  def change_status
    @task.status = @task.status == 'in_progress' ? 1 : 0
    status = @task.save ? 200 : 422
    render template: 'tasks/show.json', status: status
  end

  private

  def _set_task
    @task = Task.find(params[:id])
  end

  def _task_params
    params.require(:task).permit(:description)
  end
end
