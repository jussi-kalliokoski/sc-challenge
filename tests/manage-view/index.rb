require "selenium-webdriver"
require "rspec"
include RSpec::Expectations

describe "CreateAndDeletePlaylist" do

  before(:each) do
    @driver = Selenium::WebDriver.for :firefox
    @base_url = "http://cloudlist.avd.io"
    @driver.manage.timeouts.implicit_wait = 30
    @verification_errors = []
  end
  
  after(:each) do
    @driver.quit
    @verification_errors.should == []
  end
  
  it "test_create_and_delete_playlist" do
    @driver.get(@base_url + "/")
    @driver.find_element(:id, "new-playlist").click
    a = @driver.switch_to.alert
    a.send_keys "test playlist"
    a.accept
    sleep 1
    @driver.get(@base_url + "/")
    @driver.find_element(:css, "button.btn.btn-mini").click
    a = @driver.switch_to.alert
    a.accept
    sleep 1
  end
end
