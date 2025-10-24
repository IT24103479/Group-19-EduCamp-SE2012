public class EnrolledClassDTO {
    private Long classId;
    private String className;
    private String description;
    private String teacherName;
    private Double amount;
    private Boolean paymentCompleted;

    public EnrolledClassDTO(Long classId, String className, String description,
                            String teacherName, Double amount, Boolean paymentCompleted) {
        this.classId = classId;
        this.className = className;
        this.description = description;
        this.teacherName = teacherName;
        this.amount = amount;
        this.paymentCompleted = paymentCompleted;
    }

    // getters & setters
}
