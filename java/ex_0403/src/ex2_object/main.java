package ex2_object;

public class main {

	
    public static void main(String[] args) {

        Product[] product = {
            new Product("키보드", 5000, 10),
            new Product("마우스", 5000, 10),
            new Product("컴퓨터", 5000, 10)
        };

        for (Product p : product) {
            System.out.println(p); // 또는 p.printInfo();
        }
        
       Object [] arr = {100,"홍길동",new Employee("홍길동","개발팀")};
       
       for(Object o:arr) {
    	   if(o instanceof String) System.out.println("문자열 데이터 : " + o);
    		   else if (o instanceof Integer) System.out.println("정수 데이터 : " + o);
    		   else if (o instanceof Double) System.out.println("실수 데이터 : " + o);
    		   else if (o instanceof Employee) {
    			   Employee e = (Employee)o;
    			   System.out.println("사원명 : " + e.name);
    			   System.out.println("사원명 : " + e.dept);
    		   
    	   }
       }
    }
}