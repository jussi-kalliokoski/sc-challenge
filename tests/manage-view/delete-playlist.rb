require "selenium-webdriver"
require "rspec"
include RSpec::Expectations

describe "DeletePlaylist" do

  before(:each) do
    @driver = Selenium::WebDriver.for :firefox
    @base_url = "http://cloudlist.avd.io/"
    @driver.manage.timeouts.implicit_wait = 30
    @verification_errors = []
  end
  
  after(:each) do
    @driver.quit
    @verification_errors.should == []
  end
  
  it "test_delete_playlist" do
    @driver.get(@base_url + "/")
    @driver.find_element(:css, "button.btn.btn-mini").click
    # ERROR: Caught exception [ERROR: Unsupported command [getConfirmation]]
  end
  
  def element_present?(how, what)
    @driver.find_element(how, what)
    true
  rescue Selenium::WebDriver::Error::NoSuchElementError
    false
  end
  
  def verify(&blk)
    yield
  rescue ExpectationNotMetError => ex
    @verification_errors << ex
  end
end
