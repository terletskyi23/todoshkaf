# app/models/task.rb

# == Schema Information
#
# Table name: tasks
#
#  id          :integer          not null, primary key
#  description :text
#  status      :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Task < ActiveRecord::Base
  enum status: [ :in_progress, :done ]
  validates :description, presence: true
  validates :description, length: { minimum: 5 }
end
