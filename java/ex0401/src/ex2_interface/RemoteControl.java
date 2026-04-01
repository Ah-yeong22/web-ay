package ex2_interface;

//리모컨에 대한 가이드라인(인터페이스)
public interface RemoteControl {
	
	 int MAX_VOLUME = 10;
	    int MIN_VOLUME = 0;
	    
	    // 추상메서드
	    public void turnOn();
	    public void setVolume(int volume);
	    
	    // 디폴트 메서드
	    default void setMute(boolean mute) {
	        if (mute) {
	            System.out.println("무음 처리 합니다");
	        } else {
	            System.out.println("무음 해제합니다");
	        }
	    }
	    //정적메서드
	    static void changeBattery() {
	    	System.out.println("리모콘 건전지를 교환합니다. ");
	    }
	    //private메서드
	    //인터페이스 외부에서는 접근할 수 없는 메서드
	    private void config() {
	    	System.out.println("설정모드로 접근");
	    }
	    
	}
